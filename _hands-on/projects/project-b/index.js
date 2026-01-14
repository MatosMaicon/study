const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// URLs dos serviços internos
const LOAD_GEN_NODE_URL = process.env.LOAD_GEN_NODE_URL || 'http://load-gen-node-service.application.svc.cluster.local:80';
const PROJECT_C_URL = process.env.PROJECT_C_URL || 'http://project-c-service.application.svc.cluster.local:80';

// Função para escolher a rota do load-gen-node com probabilidade de poison
function selectLoadGenRoute() {
  const random = Math.random();
  if (random < 0.9) {
    // 90% das vezes: rota rápida
    return '/fast-expensive';
  } else {
    // 10% das vezes: uma das 3 rotas problemáticas (dividido igualmente)
    const poisonRoutes = ['/fast-cheap', '/slow-cheap', '/slow-expensive'];
    const poisonIndex = Math.floor((random - 0.9) / 0.1 * 3);
    return poisonRoutes[poisonIndex];
  }
}

// Rota /chain: chama load-gen-node/fast-expensive e project-c/chain
app.get('/chain', async (req, res) => {
  try {
    const [loadGenResponse, projectCResponse] = await Promise.all([
      axios.get(`${LOAD_GEN_NODE_URL}/fast-expensive`),
      axios.get(`${PROJECT_C_URL}/chain`)
    ]);

    res.json({
      status: 'success',
      service: 'project-b',
      loadGenNode: loadGenResponse.data,
      projectC: projectCResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /chain:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-b',
      error: error.message
    });
  }
});

// Rota /poison: cada projeto escolhe independentemente a rota do load-gen-node
app.get('/poison', async (req, res) => {
  try {
    const selectedRoute = selectLoadGenRoute();
    
    const [loadGenResponse, projectCResponse] = await Promise.all([
      axios.get(`${LOAD_GEN_NODE_URL}${selectedRoute}`),
      axios.get(`${PROJECT_C_URL}/poison`)
    ]);

    res.json({
      status: 'success',
      service: 'project-b',
      selectedRoute: selectedRoute,
      loadGenNode: loadGenResponse.data,
      projectC: projectCResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /poison:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-b',
      error: error.message
    });
  }
});

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Project B rodando na porta ${port}`);
});
