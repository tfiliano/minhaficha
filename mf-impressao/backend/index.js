const express = require('express');
const bodyParser = require('body-parser');
const PgBoss = require('pg-boss');
const { v4: uuidv4 } = require('uuid');
const printer = require('printer'); // Node-printer library for sending ZPL to printers

// Configuração do PgBoss
const boss = new PgBoss({
    connectionString: 'postgres://user:password@localhost:5432/printdb', // Substitua pelos detalhes do PostgreSQL
});

(async () => {
    await boss.start();
    console.log('pg-boss started');
})();

// Inicializa o Express
const app = express();
app.use(bodyParser.json());

// Lista de impressoras (em memória para simplificar)
const printers = [];

// Define o trabalho de impressão
boss.on('error', (error) => console.error('pg-boss error:', error));

boss.work('print-job', async (job) => {
    const { printerName, zpl } = job.data;

    // Verifica se a impressora está cadastrada
    const printerExists = printers.some((p) => p.name === printerName);
    if (!printerExists) {
        throw new Error(`Printer ${printerName} not found.`);
    }

    console.log(`Sending ZPL to ${printerName}`);

    // Envia o comando ZPL para a impressora
    try {
        printer.printDirect({
            data: zpl,
            printer: printerName,
            type: 'RAW',
            success: () => console.log(`Job for ${printerName} completed.`),
            error: (err) => { throw err; },
        });
    } catch (err) {
        throw new Error(`Failed to print on ${printerName}: ${err.message}`);
    }

    return 'Printed successfully';
});

// Rota para adicionar um novo trabalho
app.post('/add-job', async (req, res) => {
    const { printerName, zpl, priority = 1 } = req.body;

    if (!printerName || !zpl) {
        return res.status(400).json({ error: 'Printer name and ZPL content are required.' });
    }

    try {
        const jobId = await boss.publish('print-job', { printerName, zpl }, { priority });
        res.status(201).json({ message: 'Job added to queue.', jobId });
    } catch (err) {
        console.error('Failed to add job:', err);
        res.status(500).json({ error: 'Failed to add job to queue.' });
    }
});

// Rota para consultar status da fila
app.get('/queue-status', async (req, res) => {
    try {
        const jobs = await boss.getQueue({ name: 'print-job' });
        res.status(200).json(jobs);
    } catch (err) {
        console.error('Failed to fetch queue status:', err);
        res.status(500).json({ error: 'Failed to fetch queue status.' });
    }
});

// Rota para reprocessar trabalhos com falha
app.post('/retry-job/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const job = await boss.getJobById(id);
        if (!job || job.state !== 'failed') {
            return res.status(404).json({ error: 'Job not found or not in failed state.' });
        }

        await boss.retry(id);
        res.status(200).json({ message: 'Job re-added to queue.', jobId: id });
    } catch (err) {
        console.error('Failed to retry job:', err);
        res.status(500).json({ error: 'Failed to retry job.' });
    }
});

// Rota para listar impressoras
app.get('/printers', (req, res) => {
    res.status(200).json(printers);
});

// Rota para adicionar uma impressora
app.post('/printers', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Printer name is required.' });
    }

    if (printers.some((p) => p.name === name)) {
        return res.status(400).json({ error: 'Printer already exists.' });
    }

    printers.push({ id: uuidv4(), name });
    res.status(201).json({ message: 'Printer added.', printer: { name } });
});

// Rota para remover uma impressora
app.delete('/printers/:id', (req, res) => {
    const { id } = req.params;

    const index = printers.findIndex((p) => p.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Printer not found.' });
    }

    printers.splice(index, 1);
    res.status(200).json({ message: 'Printer removed.' });
});

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Bridge running on http://localhost:${PORT}`);
});
