#!/bin/bash

# Script para buildar e carregar todas as imagens no cluster Kind
# Nome do cluster Kind
CLUSTER_NAME="kind-lab"
# Pega a versão do argumento ou usa 'latest' por padrão
TAG=${1:-"latest"}

# Cores para o output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Array com os projetos
PROJECTS=("load-gen-node" "project-a" "project-b" "project-c")

# Diretório base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}==> Buildando e carregando ${#PROJECTS[@]} imagens no cluster Kind '${CLUSTER_NAME}'${NC}\n"

for PROJECT in "${PROJECTS[@]}"; do
  PROJECT_DIR="${BASE_DIR}/${PROJECT}"
  IMAGE_NAME="localhost/${PROJECT}"
  
  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Diretório ${PROJECT_DIR} não encontrado, pulando...${NC}"
    continue
  fi
  
  echo -e "${BLUE}==> Buildando ${PROJECT}...${NC}"
  cd "$PROJECT_DIR"
  
  docker build -t ${IMAGE_NAME}:${TAG} .
  
  # Se a tag não for 'latest', cria uma tag 'latest' também para facilitar
  if [ "$TAG" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest
  fi
  
  echo -e "${GREEN}==> Build de ${PROJECT} concluído.${NC}"
  
  echo -e "${BLUE}==> Carregando ${PROJECT} no cluster Kind...${NC}"
  kind load docker-image ${IMAGE_NAME}:${TAG} --name ${CLUSTER_NAME}
  
  echo -e "${GREEN}==> ${PROJECT} carregado com sucesso!${NC}\n"
done

echo -e "${GREEN}==> Todos os projetos foram buildados e carregados no cluster Kind!${NC}"
echo -e "Lembre-se de definir: ${BLUE}imagePullPolicy: IfNotPresent${NC} nos manifestos de Deployment"
