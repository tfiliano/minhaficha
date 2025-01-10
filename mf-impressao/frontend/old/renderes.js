// frontend/renderer.js

const API_URL = 'http://localhost:3000/api';

async function fetchPrinters() {
    try {
        const response = await fetch(`${API_URL}/printers`);
        const data = await response.json();
        displayPrinters(data.printers);
    } catch (error) {
        console.error('Erro ao buscar impressoras:', error);
    }
}

function displayPrinters(printers) {
    const printersDiv = document.getElementById('printers');
    printersDiv.innerHTML = '';

    printers.forEach(printer => {
        const printerDiv = document.createElement('div');
        printerDiv.className = 'printer-item';

        printerDiv.innerHTML = `
            <h3>${printer.name}</h3>
            <p><strong>IP:</strong> ${printer.ip}</p>
            <p><strong>Porta:</strong> ${printer.port}</p>
            <p><strong>Descrição:</strong> ${printer.description || 'N/A'}</p>
            <button onclick="deletePrinter(${printer.id})">Deletar</button>
        `;

        printersDiv.appendChild(printerDiv);
    });
}

async function addPrinter() {
    const name = document.getElementById('name').value;
    const ip = document.getElementById('ip').value;
    const port = parseInt(document.getElementById('port').value, 10);
    const description = document.getElementById('description').value;

    if (!name || !ip) {
        alert('Nome e IP são obrigatórios.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/printers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ip, port, description }),
        });
        const result = await response.json();
        if (result.id) {
            alert('Impressora adicionada com sucesso!');
            fetchPrinters();
        }
    } catch (error) {
        console.error('Erro ao adicionar impressora:', error);
    }
}

async function deletePrinter(id) {
    if (!confirm('Tem certeza que deseja deletar esta impressora?')) return;

    try {
        const response = await fetch(`${API_URL}/printers/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (result.changes) {
            alert('Impressora deletada com sucesso!');
            fetchPrinters();
        }
    } catch (error) {
        console.error('Erro ao deletar impressora:', error);
    }
}

// Inicializar a lista de impressoras ao carregar
window.onload = fetchPrinters;
