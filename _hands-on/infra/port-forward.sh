#!/bin/bash

NAMESPACE="hands-on-lab"
SERVICE="load-gen-node-service"
PORT="8080"

echo "🔌 Iniciando Port-Forward para o serviço $SERVICE..."
echo "📍 Endereço local: http://localhost:$PORT"
echo "💡 Dica: Use CTRL+C para parar o proxy."

# Loop para reconectar automaticamente caso a conexão caia
while true; do
  kubectl port-forward svc/$SERVICE $PORT:80 -n $NAMESPACE
  echo "⚠️ Conexão perdida. Tentando reconectar em 2 segundos..."
  sleep 2
done