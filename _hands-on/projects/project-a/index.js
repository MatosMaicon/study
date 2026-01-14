const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// URLs dos serviços internos
const LOAD_GEN_NODE_URL = process.env.LOAD_GEN_NODE_URL || 'http://load-gen-node-service.application.svc.cluster.local:80';
const PROJECT_B_URL = process.env.PROJECT_B_URL || 'http://project-b-service.application.svc.cluster.local:80';

// Função para escolher a rota do load-gen-node com probabilidade de poison
function selectLoadGenRoute() {
  const random = Math.random();
  if (random < 0.9) {
    // 90% das vezes: rota rápida e barata
    return '/fast-cheap';
  } else {
    // 10% das vezes: uma das 3 rotas mais pesadas (dividido igualmente)
    const poisonRoutes = ['/fast-expensive', '/slow-cheap', '/slow-expensive'];
    const poisonIndex = Math.floor((random - 0.9) / 0.1 * 3);
    return poisonRoutes[poisonIndex];
  }
}

// Rota /chain: chama load-gen-node/fast-expensive e project-b/chain
app.get('/chain', async (req, res) => {
  try {
    const [loadGenResponse, projectBResponse] = await Promise.all([
      axios.get(`${LOAD_GEN_NODE_URL}/fast-expensive`),
      axios.get(`${PROJECT_B_URL}/chain`)
    ]);

    res.json({
      status: 'success',
      service: 'project-a',
      loadGenNode: loadGenResponse.data,
      projectB: projectBResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /chain:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-a',
      error: error.message
    });
  }
});

// Rota /poison: cada projeto escolhe independentemente a rota do load-gen-node
app.get('/poison', async (req, res) => {
  try {
    const selectedRoute = selectLoadGenRoute();
    
    const [loadGenResponse, projectBResponse] = await Promise.all([
      axios.get(`${LOAD_GEN_NODE_URL}${selectedRoute}`),
      axios.get(`${PROJECT_B_URL}/poison`)
    ]);

    res.json({
      status: 'success',
      service: 'project-a',
      selectedRoute: selectedRoute,
      loadGenNode: loadGenResponse.data,
      projectB: projectBResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /poison:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-a',
      error: error.message
    });
  }
});

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Project A rodando na porta ${port}`);
});
