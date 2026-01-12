#!/bin/bash

# Função para fazer port-forward com reconexão automática
port_forward_loop() {
  local namespace=$1
  local service=$2
  local local_port=$3
  local target_port=$4
  local name=$5

  while true; do
    echo "🔌 [$name] Iniciando Port-Forward para $service..."
    kubectl port-forward svc/$service $local_port:$target_port -n $namespace 2>/dev/null
    echo "⚠️ [$name] Conexão perdida. Tentando reconectar em 2 segundos..."
    sleep 2
  done
}

# Port-forward do Load Gen Node
port_forward_loop "application" "load-gen-node-service" "8080" "80" "LoadGen" &
LOADGEN_PID=$!

# Port-forward do SigNoz (Frontend + API)
port_forward_loop "platform" "signoz" "3301" "8080" "SigNoz" &
SIGNOZ_PID=$!

# Port-forward do Kong Admin API
port_forward_loop "platform" "kong-kong-admin" "8001" "8001" "KongAdminAPI" &
KONG_ADMIN_PID=$!

# Port-forward do Kong Manager (Interface Gráfica)
port_forward_loop "platform" "kong-kong-manager" "8002" "8002" "KongManager" &
KONG_GUI_PID=$!

echo "🚀 Port-Forwards iniciados:"
echo "📍 Load Gen Node: http://localhost:8080"
echo "📍 SigNoz: http://localhost:3301"
echo "📍 Kong Admin API: http://localhost:8001"
echo "📍 Kong Manager (UI): http://localhost:8002"
echo "💡 Dica: Use CTRL+C para parar os proxies."

# Função de cleanup ao receber SIGINT ou SIGTERM
cleanup() {
  echo ""
  echo "🛑 Encerrando port-forwards..."
  kill $LOADGEN_PID $SIGNOZ_PID $KONG_ADMIN_PID $KONG_GUI_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Aguarda os processos em background
wait