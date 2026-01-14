const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// URL do serviço load-gen-node
const LOAD_GEN_NODE_URL = process.env.LOAD_GEN_NODE_URL || 'http://load-gen-node-service.application.svc.cluster.local:80';

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

// Rota /chain: chama load-gen-node/fast-expensive
app.get('/chain', async (req, res) => {
  try {
    const loadGenResponse = await axios.get(`${LOAD_GEN_NODE_URL}/fast-expensive`);

    res.json({
      status: 'success',
      service: 'project-c',
      loadGenNode: loadGenResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /chain:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-c',
      error: error.message
    });
  }
});

// Rota /poison: escolhe independentemente a rota do load-gen-node
app.get('/poison', async (req, res) => {
  try {
    const selectedRoute = selectLoadGenRoute();
    const loadGenResponse = await axios.get(`${LOAD_GEN_NODE_URL}${selectedRoute}`);

    res.json({
      status: 'success',
      service: 'project-c',
      selectedRoute: selectedRoute,
      loadGenNode: loadGenResponse.data
    });
  } catch (error) {
    console.error('Erro na rota /poison:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'project-c',
      error: error.message
    });
  }
});

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Project C rodando na porta ${port}`);
});
