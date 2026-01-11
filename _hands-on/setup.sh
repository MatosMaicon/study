#!/bin/bash
cd infra && ./create-cluster.sh # já roda o setup do helm
cd /projects/load-gen-node && ./load-to-kind.sh
kubectl apply -f /infra/manifest/
