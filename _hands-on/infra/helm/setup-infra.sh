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

echo -e "\n${GREEN}✅ Instalação concluída!${NC}"
echo -e "Verifique os pods com: ${BLUE}kubectl get pods -A${NC}"

