const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Função auxiliar para simular uso intenso de CPU (bloqueia o event loop)
function blockCpu(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        // Operação síncrona para consumir CPU
        Math.sqrt(Math.random() * 1000000);
    }
}

// 1) Rota rápida e barata (~200ms, pouco recurso)
app.get('/fast-cheap', (req, res) => {
    setTimeout(() => {
        res.json({
            status: 'success',
            message: 'Rápida e barata',
            duration: '200ms',
            type: 'asynchronous'
        });
    }, 200);
});

// 2) Rota lenta e barata (~5000ms, pouco recurso)
app.get('/slow-cheap', (req, res) => {
    setTimeout(() => {
        res.json({
            status: 'success',
            message: 'Lenta e barata',
            duration: '5000ms',
            type: 'asynchronous'
        });
    }, 5000);
});

// 3) Rota rápida e cara (~200ms, muito recurso - CPU Bound)
app.get('/fast-expensive', (req, res) => {
    blockCpu(200);
    res.json({
        status: 'success',
        message: 'Rápida e cara (CPU Intenso)',
        duration: '200ms',
        type: 'synchronous'
    });
});

// 4) Rota lenta e cara (~5000ms, muito recurso - CPU Bound)
app.get('/slow-expensive', (req, res) => {
    blockCpu(5000);
    res.json({
        status: 'success',
        message: 'Lenta e cara (CPU Intenso)',
        duration: '5000ms',
        type: 'synchronous'
    });
});

// Rota de Health Check (útil para K8s)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`App rodando na porta ${port}`);
});

