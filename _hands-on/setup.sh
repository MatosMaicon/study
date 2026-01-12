#!/bin/bash
./infra/create-cluster.sh # já roda o setup do helm
./projects/load-gen-node/load-to-kind.sh
kubectl apply -f ./infra/manifest/
kubectl apply -f ./infra/manifest/
