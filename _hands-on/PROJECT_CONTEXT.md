# 🧠 Base de Conhecimento - Projeto Load Gen Node (K8s Study)

Este documento serve como bússola de contexto para o desenvolvimento do laboratório de estudos de Kubernetes, focado em escalabilidade, observabilidade e infraestrutura.

## 🚀 Objetivo do Projeto
Criar um ambiente controlado para estudar o comportamento de aplicações em containers, testando especificamente:
- **HPA (Horizontal Pod Autoscaler)** sob estresse de CPU.
- **Limites de Recursos** (Requests/Limits) em nós simulados.
- **Infraestrutura como Código** usando manifestos K8s e Helm.
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
- `port-forward.sh`: Cria um túnel estável (`port-forward`) para `localhost:8080`.

### 2. Infraestrutura (`/infra`)
Configurações do ambiente de execução.

**Cluster Kind (`kind.yaml`):**
- 1 Nó Control-Plane.
- 3 Nós Workers.
- **Limitação de Recursos**: Cada worker é configurado para simular **2 CPUs e 4GB de RAM** (via `kube-reserved` e `system-reserved`).

**Manifestos K8s (`/infra/manifest`):**
- **Namespace**: `hands-on-lab`.
- **Deployment**: Configurado com 100m CPU de request e afinidade para NÃO rodar no control-plane.
- **Service**: Tipo `LoadBalancer` (usamos proxy por limitações de rede WSL2).
- **HPA**: Escala de 1 a 10 réplicas quando o uso de CPU passa de 50%.

**Automação Helm (`/infra/helm`):**
- `setup-infra.sh`: Script para instalar Metrics Server, Kong e Istio.
- `metrics-server/values.yaml`: Configurado para aceitar certificados do Kind.

---

## 🛠️ Comandos Comuns (Cheat Sheet)

### Subir o ambiente do zero:
1. `cd infra && ./create-cluster.sh` # já roda o setup do helm
2. `cd ../../projects/load-gen-node && ./load-to-kind.sh`
3. `kubectl apply -f ../../infra/manifest/`

### Monitorar o HPA e Pods:
```bash
watch -n 1 "kubectl get hpa,pods -n hands-on-lab"
```

### Monitorar Consumo dos Nós:
```bash
watch -n 1 kubectl top nodes
```

---

## 📝 Notas de Contexto para a IA
- **WSL2 Environment**: Priorize `port-forward` ou `ingress` via `localhost`.
- **Porta do Container**: A aplicação roda internamente na porta `3000`.
- **Estratégia de Carga**: Use a rota `/slow-expensive` para testar o scaling, pois ela trava a thread do Node e consome 100% da fatia de CPU do container.

