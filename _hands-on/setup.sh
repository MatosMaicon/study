#!/bin/bash
# Create cluster and setup infra
kind create cluster --name kind-lab --config ./infra/kind.yaml
./infra/helm/setup-infra.sh
# Build all projects
./projects/build-all.sh

# Aplica namespaces primeiro para evitar erros de dependência
echo "Aplicando namespaces..."
kubectl apply -f ./infra/manifest/namespace.yaml
kubectl apply -f ./infra/manifest/platform-namespace.yaml

# Aguarda um momento para garantir que os namespaces estejam criados
sleep 2

# Aplica todos os outros manifestos
echo "Aplicando demais recursos..."
kubectl apply -f ./infra/manifest/ --recursive
