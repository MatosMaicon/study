#!/bin/bash

# Nome da imagem
IMAGE_NAME="localhost/load-gen-node"
# Pega a versão do argumento ou usa 'latest' por padrão
TAG=${1:-"latest"}
# Nome do cluster Kind (ajuste se o seu tiver outro nome)
CLUSTER_NAME="kind-lab"

# Cores para o output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==> 1/2 Iniciando Build local da imagem: ${IMAGE_NAME}:${TAG}${NC}"
docker build -t ${IMAGE_NAME}:${TAG} .

# Se a tag não for 'latest', cria uma tag 'latest' também para facilitar
if [ "$TAG" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest
fi

echo -e "${GREEN}==> Build concluído com sucesso.${NC}"

echo -e "\n${BLUE}==> 2/2 Carregando imagem no cluster Kind '${CLUSTER_NAME}'...${NC}"
echo -e "${YELLOW}(Isso evita a necessidade de push/pull para o Docker Hub)${NC}"

kind load docker-image ${IMAGE_NAME}:${TAG} --name ${CLUSTER_NAME}

echo -e "\n${GREEN}==> Sucesso! A imagem agora está disponível dentro do seu cluster Kind.${NC}"
echo -e "No seu manifesto de Deployment, use: ${BLUE}image: ${IMAGE_NAME}:${TAG}${NC}"
echo -e "Lembre-se de definir: ${BLUE}imagePullPolicy: IfNotPresent${NC}"

