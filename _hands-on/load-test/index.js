#!/usr/bin/env node

/**
 * Script de Teste de Carga para o Projeto K8s Study
 * Uso: node index.js <paralelismo> <duracao_segundos>
 * Exemplo: node index.js 5 120
 */

const CONCURRENCY = parseInt(process.argv[2]);
const DURATION_SECONDS = parseInt(process.argv[3]);
const URL = 'http://localhost:8000/project-a/poison';

if (isNaN(CONCURRENCY) || isNaN(DURATION_SECONDS)) {
    console.log('Uso: node index.js <paralelismo> <duracao_segundos>');
    console.log('Exemplo: node index.js 5 120');
    process.exit(1);
}

const endTime = Date.now() + (DURATION_SECONDS * 1000);
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;

async function worker(id) {
    while (Date.now() < endTime) {
        totalRequests++;
        const start = Date.now();
        try {
            // Usando fetch nativo do Node 18+
            const response = await fetch(URL);
            const duration = Date.now() - start;
            
            if (response.ok) {
                successfulRequests++;
                console.log(`[Worker ${id}] Request #${totalRequests} - OK (${duration}ms)`);
            } else {
                failedRequests++;
                console.log(`[Worker ${id}] Request #${totalRequests} - FAILED: ${response.status} (${duration}ms)`);
            }
        } catch (error) {
            failedRequests++;
            const duration = Date.now() - start;
            console.log(`[Worker ${id}] Request #${totalRequests} - ERROR: ${error.message} (${duration}ms)`);
        }
    }
}

console.log(`\n🚀 Iniciando teste de carga:`);
console.log(`   - URL: ${URL}`);
console.log(`   - Paralelismo: ${CONCURRENCY}`);
console.log(`   - Duração: ${DURATION_SECONDS} segundos\n`);

const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
}

Promise.all(workers).then(() => {
    console.log('\n--- 📊 Resultado do Teste de Carga ---');
    console.log(`Total de Requisições: ${totalRequests}`);
    console.log(`Sucessos: ${successfulRequests}`);
    console.log(`Falhas: ${failedRequests}`);
    console.log(`Taxa de Sucesso: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
    console.log('--------------------------------------\n');
});
