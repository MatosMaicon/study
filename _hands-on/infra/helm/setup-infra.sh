#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando instalação da infraestrutura via Helm...${NC}"

# Garante que o script rode a partir do diretório onde ele está
cd "$(dirname "$0")"

# 1. Metrics Server
echo -e "\n${BLUE}📊 Instalando Metrics Server...${NC}"
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
helm repo update
helm upgrade --install metrics-server metrics-server/metrics-server \
  --namespace kube-system \
  -f metrics-server/values.yaml

# 2. Kong
#echo -e "\n${BLUE}🦍 Instalando Kong API Gateway...${NC}"
#helm repo add kong https://charts.konghq.com
#helm repo update
#helm upgrade --install kong kong/kong \
#  --namespace kong --create-namespace \
#  -f kong/values.yaml

# 3. Istio (Base e Istiod)
#echo -e "\n${BLUE}⛵ Instalando Istio (Base)...${NC}"
#helm repo add istio https://istio-release.storage.googleapis.com/charts
#helm repo update
#helm upgrade --install istio-base istio/base \
#  --namespace istio-system --create-namespace

#echo -e "${BLUE}⛵ Instalando Istio (Discovery/Istiod)...${NC}"
#helm upgrade --install istiod istio/istiod \
#  --namespace istio-system \
#  -f istio/values.yaml

# 4. SigNoz
echo -e "\n${BLUE}📊 Instalando SigNoz...${NC}"
helm repo add signoz https://charts.signoz.io
helm repo update
helm upgrade --install signoz signoz/signoz \
  --namespace platform --create-namespace \
  --wait \
  --timeout 1h \
  -f signoz/values.yaml

echo -e "\n${GREEN}✅ Instalação concluída!${NC}"
echo -e "Verifique os pods com: ${BLUE}kubectl get pods -A${NC}"
echo -e "Acesse o SigNoz com: ${BLUE}kubectl port-forward -n platform svc/signoz-frontend 3301:3301${NC}"

