// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const net = require('net');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.json());

// Rota para obter todas as impressoras
app.get('/api/printers', (req, res) => {
    db.all('SELECT * FROM printers', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ printers: rows });
    });
});

// Rota para adicionar uma nova impressora
app.post('/api/printers', (req, res) => {
    const { name, ip, port, description } = req.body;
    db.run(
        `INSERT INTO printers (name, ip, port, description) VALUES (?, ?, ?, ?)`,
        [name, ip, port || 9100, description],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Rota para atualizar uma impressora
app.put('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    const { name, ip, port, description } = req.body;
    db.run(
        `UPDATE printers SET name = ?, ip = ?, port = ?, description = ? WHERE id = ?`,
        [name, ip, port, description, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ changes: this.changes });
        }
    );
});

// Rota para deletar uma impressora
app.delete('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM printers WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changes: this.changes });
    });
});

// Rota para enviar ZPL para uma impressora específica
app.post('/api/print', (req, res) => {
    const { printerId, zpl } = req.body;

    if (!printerId || !zpl) {
        return res.status(400).json({ error: 'printerId e zpl são obrigatórios.' });
    }

    db.get('SELECT * FROM printers WHERE id = ?', [printerId], (err, printer) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!printer) {
            return res.status(404).json({ error: 'Impressora não encontrada.' });
        }

        const client = new net.Socket();
        client.connect(printer.port, printer.ip, () => {
            console.log(`Conectado à impressora ${printer.name} (${printer.ip}:${printer.port})`);
            client.write(zpl);
            client.end();
            res.json({ message: 'Comando ZPL enviado com sucesso.' });
        });

        client.on('error', (error) => {
            console.error('Erro ao conectar à impressora:', error);
            res.status(500).json({ error: 'Falha na comunicação com a impressora.' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});
