#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando instalação da infraestrutura via Helm...${NC}"

# Garante que o script rode a partir do diretório onde ele está
cd "$(dirname "$0")"

# 0. Preparar Namespaces e Labels (Crítico para o Istio)
echo -e "\n${BLUE}📂 Preparando Namespaces...${NC}"
kubectl apply -f ../manifest/namespace.yaml
kubectl apply -f ../manifest/platform-namespace.yaml

# 1. Metrics Server
echo -e "\n${BLUE}📊 Instalando Metrics Server...${NC}"
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
helm repo update
helm upgrade --install metrics-server metrics-server/metrics-server \
  --namespace kube-system \
  -f metrics-server/values.yaml

# 2. Kong
echo -e "\n${BLUE}🦍 Instalando Kong API Gateway (DB-less)...${NC}"
helm repo add kong https://charts.konghq.com
helm repo update

helm upgrade --install kong kong/kong \
  --namespace platform --create-namespace \
  -f kong/values.yaml

# 3. Istio (Base e Istiod)
echo -e "\n${BLUE}⛵ Instalando Istio (Base)...${NC}"
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

# O Istio usa o namespace istio-system por padrão
helm upgrade --install istio-base istio/base \
  --namespace istio-system --create-namespace

echo -e "${BLUE}⛵ Instalando Istio (Discovery/Istiod)...${NC}"
# O Istiod (control plane) roda no namespace istio-system (padrão do Istio)
helm upgrade --install istiod istio/istiod \
  --namespace istio-system --create-namespace \
  -f istio/values.yaml

# 4. SigNoz
echo -e "\n${BLUE}📊 Instalando SigNoz...${NC}"
helm repo add signoz https://charts.signoz.io
helm repo update
helm upgrade --install signoz signoz/signoz \
  --namespace platform --create-namespace \
  --wait \
  --timeout 1h \
  -f signoz/values.yaml

# 5. SigNoz K8s Infra (Metrics/Logs Collector)
echo -e "\n${BLUE}📊 Instalando SigNoz K8s Infra...${NC}"
helm upgrade --install signoz-k8s-infra signoz/k8s-infra \
  --namespace platform \
  -f signoz/k8s-infra-values.yaml

echo -e "\n${GREEN}✅ Instalação concluída!${NC}"
echo -e "Verifique os pods com: ${BLUE}kubectl get pods -A${NC}"
echo -e "Acesse o SigNoz com: ${BLUE}kubectl port-forward -n platform svc/signoz 3301:8080${NC}"

