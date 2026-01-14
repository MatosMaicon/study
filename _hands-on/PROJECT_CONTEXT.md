# 🧠 Base de Conhecimento - Projeto Load Gen Node (K8s Study)

Este documento serve como bússola de contexto para o desenvolvimento do laboratório de estudos de Kubernetes, focado em escalabilidade, observabilidade e infraestrutura.

## 🚀 Objetivo do Projeto
Criar um ambiente controlado para estudar o comportamento de aplicações em containers, testando especificamente:
- **HPA (Horizontal Pod Autoscaler)** sob estresse de CPU.
- **Limites de Recursos** (Requests/Limits) em nós simulados.
- **Infraestrutura como Código** usando manifestos K8s e Helm.
- **Observabilidade** com SigNoz (métricas, logs e traces).
- **API Gateway e Service Mesh** (Kong/Istio - Próximos passos).

---

## 🏗️ Estrutura do Projeto

### 1. Backend - Load Gen Node (`/projects/load-gen-node`)
Aplicação Node.js (Express) que simula comportamentos de carga:
- **GET /fast-cheap**: 200ms (Assíncrono).
- **GET /slow-cheap**: 5000ms (Assíncrono).
- **GET /fast-expensive**: 200ms (CPU Bound - Trava o Event Loop).
- **GET /slow-expensive**: 5000ms (CPU Bound - Trava o Event Loop).

### 2. Backend - Cadeia de Microserviços (`/projects/project-{a,b,c}`)
Três microserviços Node.js (Express) que formam uma cadeia de chamadas:

**Project A** (exposto via Kong Gateway em `/project-a`):
- **GET /chain**: Chama `load-gen-node/fast-expensive` e delega para `project-b/chain`.
- **GET /poison**: Escolhe independentemente uma rota do `load-gen-node` (90% `/fast-expensive`, 10% dividido entre as outras 3 rotas) e delega para `project-b/poison`.

**Project B** (acesso apenas interno):
- **GET /chain**: Chama `load-gen-node/fast-expensive` e delega para `project-c/chain`.
- **GET /poison**: Escolhe independentemente uma rota do `load-gen-node` (mesma lógica do Project A) e delega para `project-c/poison`.

**Project C** (acesso apenas interno):
- **GET /chain**: Chama `load-gen-node/fast-expensive`.
- **GET /poison**: Escolhe independentemente uma rota do `load-gen-node` (mesma lógica dos outros projetos).

**Scripts:**
- `build-all.sh`: Localizado em `/projects`, builda e carrega todas as imagens Docker (`load-gen-node`, `project-a`, `project-b`, `project-c`) no cluster Kind.
- `port-forward.sh`: Localizado em `/infra`, cria túneis estáveis para `localhost:8000` (Kong Gateway), `localhost:3301` (SigNoz), `localhost:8001` (Kong API) e `localhost:8002` (Kong Manager).

### 2. Infraestrutura (`/infra`)
Configurações do ambiente de execução.

**Cluster Kind (`kind.yaml`):**
- 1 Nó Control-Plane.
- 3 Nós Workers (Application): Dedicados ao namespace `application` via taints e labels (label `workload=application`).
- 1 Nó Worker (Platform): Sem restrições de recursos, dedicado para ferramentas de plataforma (label `workload=platform`).

**Manifestos K8s (`/infra/manifest`):**
- **Namespace**: `application`.
- **Load Gen Node**: Deployment, Service, HPA e Ingress (exposto em `/load-gen-node`).
- **Project A**: Deployment, Service, HPA e Ingress (exposto em `/project-a` via Kong Gateway).
- **Project B & C**: Deployment, Service e HPA (acesso apenas interno via service mesh).
- Todos os Deployments configurados com 100m CPU de request, `nodeSelector` e `tolerations` para rodar exclusivamente nos nós de aplicação.
- Todos os Services são do tipo `LoadBalancer` (usamos proxy por limitações de rede WSL2).
- Todos os HPAs escalam de 1 a 10 réplicas quando o uso de CPU passa de 50%.

**Automação Helm (`/infra/helm`):**
- `setup-infra.sh`: Script para instalar Metrics Server, SigNoz, SigNoz K8s Infra, Kong e Istio.
- `metrics-server/values.yaml`: Configurado para aceitar certificados do Kind.
- `signoz/values.yaml`: Configuração do SigNoz com `nodeSelector` para o nó `workload=platform` e recursos otimizados.
- `signoz/k8s-infra-values.yaml`: Configuração para coleta de métricas e logs de todos os nós do cluster.

---

## 🛠️ Comandos Comuns (Cheat Sheet)

### Subir o ambiente do zero:
1. `cd infra && ./create-cluster.sh` # já roda o setup do helm
2. `cd ../projects && ./build-all.sh` # builda e carrega todas as imagens (load-gen-node, project-a, project-b, project-c)
3. `kubectl apply -f ../infra/manifest/ --recursive`
ou
`./setup.sh`

### Monitorar o HPA e Pods:
```bash
watch -n 1 "kubectl get hpa,pods -n application"
```

### Monitorar Consumo dos Nós:
```bash
watch -n 1 kubectl top nodes
```

### Acessar SigNoz:
```bash
# Via port-forward (já incluído no script port-forward.sh em /infra)
# Mapeamos a porta local 3301 para a porta 8080 do SigNoz
kubectl port-forward -n platform svc/signoz 3301:8080

# Ou usar o script completo que inclui os serviços de plataforma
cd infra && ./port-forward.sh
```

### Acessar Kong:
```bash
# Gateway Proxy (Acesso à Aplicação)
# Mapeado via Ingress para os paths:
# - /load-gen-node (Load Gen Node)
# - /project-a (Project A - único exposto externamente)
kubectl port-forward -n platform svc/kong-kong-proxy 8000:80

# Admin API (Read-only no modo DB-less)
kubectl port-forward -n platform svc/kong-kong-admin 8001:8001

# Kong Manager (Interface Gráfica)
kubectl port-forward -n platform svc/kong-kong-manager 8002:8002
```

### Testar a Cadeia de Microserviços:
```bash
# Via Kong Gateway (Project A exposto)
curl http://localhost:8000/project-a/chain
curl http://localhost:8000/project-a/poison

# Os Projects B e C só podem ser acessados internamente via service mesh
```

### Verificar Pods do SigNoz e Kong:
```bash
kubectl get pods -n platform
```

---

## 📝 Notas de Contexto para a IA
- **WSL2 Environment**: Priorize `port-forward` ou `ingress` via `localhost`.
- **Porta do Container**: Todas as aplicações rodam internamente na porta `3000`.
- **Estratégia de Carga**: Use a rota `/slow-expensive` do `load-gen-node` para testar o scaling, pois ela trava a thread do Node e consome 100% da fatia de CPU do container.
- **Cadeia de Microserviços**: Os projetos A, B e C formam uma cadeia onde cada um chama o `load-gen-node` e delega para o próximo. Apenas o Project A é exposto via Kong Gateway. Os Projects B e C são acessíveis apenas internamente via service mesh.
- **Rota Poison**: A rota `/poison` implementa uma lógica de "poison" onde cada projeto independentemente sorteia a rota do `load-gen-node` (90% `/fast-expensive`, 10% dividido entre `/fast-cheap`, `/slow-cheap` e `/slow-expensive`). Isso permite simular falhas e degradação de performance de forma distribuída.
- **Namespace Platform**: O namespace `platform` contém ferramentas de observabilidade (SigNoz) e roda exclusivamente no nó com label `workload=platform`.
- **Convenção Helm**: Toda instalação via Helm deve seguir o padrão do projeto, sendo centralizada no diretório `./infra/helm/`, com seus respectivos arquivos `values.yaml` organizados em subpastas e automatizada no script `setup-infra.sh`.
- **SigNoz**: Plataforma de observabilidade instalada via Helm (v0.106.0+). O frontend e a API são unificados no serviço `signoz`. Acessível em `localhost:3301` (mapeado para `8080` no cluster) após port-forward. Coleta métricas, logs e traces das aplicações, permitindo visualizar a cadeia completa de chamadas entre os microserviços.

