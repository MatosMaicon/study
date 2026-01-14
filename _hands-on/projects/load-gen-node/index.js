const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 1) Rota rápida e barata (~200ms, pouco recurso)
app.get('/fast-cheap', (req, res) => {
    setTimeout(() => {
        res.json({
            status: 'success',
            message: 'Rápida e barata',
            duration: '200ms'
        });
    }, 200);
});

// 2) Rota lenta e barata (~5000ms, pouco recurso)
app.get('/slow-cheap', (req, res) => {
    setTimeout(() => {
        res.json({
            status: 'success',
            message: 'Lenta e barata',
            duration: '5000ms'
        });
    }, 5000);
});

// 3) Rota rápida e pesada (Aloca 50MB temporariamente)
app.get('/fast-expensive', (req, res) => {
    // Aloca 50MB
    const buffer = Buffer.alloc(50 * 1024 * 1024, 'x');
    
    setTimeout(() => {
        const size = buffer.length / 1024 / 1024;
        res.json({
            status: 'success',
            message: `Alocou ${size}MB temporariamente`,
            duration: '200ms'
        });
    }, 200);
});

// 4) Rota lenta e pesada (Aloca 50MB temporariamente)
app.get('/slow-expensive', (req, res) => {
    // Aloca 50MB
    const buffer = Buffer.alloc(50 * 1024 * 1024, 'x');
    
    setTimeout(() => {
        const size = buffer.length / 1024 / 1024;
        res.json({
            status: 'success',
            message: `Alocou ${size}MB temporariamente`,
            duration: '5000ms'
        });
    }, 5000);
});

// Rota de Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`App rodando na porta ${port}`);
});
