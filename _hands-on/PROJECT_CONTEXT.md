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

### 1. Backend (`/projects/load-gen-node`)
Aplicação Node.js (Express) que simula comportamentos de carga:
- **GET /fast-cheap**: 200ms (Assíncrono).
- **GET /slow-cheap**: 5000ms (Assíncrono).
- **GET /fast-expensive**: 200ms (CPU Bound - Trava o Event Loop).
- **GET /slow-expensive**: 5000ms (CPU Bound - Trava o Event Loop).

**Scripts:**
- `load-to-kind.sh`: Builda a imagem Docker local (`localhost/load-gen-node`) e injeta no cluster.
- `port-forward.sh`: Cria túneis estáveis (`port-forward`) para `localhost:8080` (Load Gen Node) e `localhost:3301` (SigNoz Frontend).

### 2. Infraestrutura (`/infra`)
Configurações do ambiente de execução.

**Cluster Kind (`kind.yaml`):**
- 1 Nó Control-Plane.
- 3 Nós Workers (Application): Dedicados ao namespace `application` via taints e labels (label `workload=application`).
- 1 Nó Worker (Platform): Sem restrições de recursos, dedicado para ferramentas de plataforma (label `workload=platform`).

**Manifestos K8s (`/infra/manifest`):**
- **Namespace**: `application`.
- **Deployment**: Configurado com 100m CPU de request, `nodeSelector` e `tolerations` para rodar exclusivamente nos nós de aplicação.
- **Service**: Tipo `LoadBalancer` (usamos proxy por limitações de rede WSL2).
- **HPA**: Escala de 1 a 10 réplicas quando o uso de CPU passa de 50%.

**Automação Helm (`/infra/helm`):**
- `setup-infra.sh`: Script para instalar Metrics Server, SigNoz, SigNoz K8s Infra, Kong e Istio.
- `metrics-server/values.yaml`: Configurado para aceitar certificados do Kind.
- `signoz/values.yaml`: Configuração do SigNoz com `nodeSelector` para o nó `workload=platform` e recursos otimizados.
- `signoz/k8s-infra-values.yaml`: Configuração para coleta de métricas e logs de todos os nós do cluster.

---

## 🛠️ Comandos Comuns (Cheat Sheet)

### Subir o ambiente do zero:
1. `cd infra && ./create-cluster.sh` # já roda o setup do helm
2. `cd ../../projects/load-gen-node && ./load-to-kind.sh`
3. `kubectl apply -f ../../infra/manifest/`
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
# Via port-forward (já incluído no script port-forward.sh)
# Mapeamos a porta local 3301 para a porta 8080 do SigNoz
kubectl port-forward -n platform svc/signoz 3301:8080

# Ou usar o script completo que inclui ambos os serviços
cd infra && ./port-forward.sh
```

### Verificar Pods do SigNoz:
```bash
kubectl get pods -n platform
```

---

## 📝 Notas de Contexto para a IA
- **WSL2 Environment**: Priorize `port-forward` ou `ingress` via `localhost`.
- **Porta do Container**: A aplicação roda internamente na porta `3000`.
- **Estratégia de Carga**: Use a rota `/slow-expensive` para testar o scaling, pois ela trava a thread do Node e consome 100% da fatia de CPU do container.
- **Namespace Platform**: O namespace `platform` contém ferramentas de observabilidade (SigNoz) e roda exclusivamente no nó com label `workload=platform`.
- **SigNoz**: Plataforma de observabilidade instalada via Helm (v0.106.0+). O frontend e a API são unificados no serviço `signoz`. Acessível em `localhost:3301` (mapeado para `8080` no cluster) após port-forward. Coleta métricas, logs e traces das aplicações.

