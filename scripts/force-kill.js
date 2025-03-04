/**
 * Script auxiliar para forçar o encerramento do processo do aplicativo
 * antes de construir uma nova versão.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Processa o nome do executável
const processName = "Minha Ficha - Print Service.exe";

console.log(`Verificando se ${processName} está em execução...`);

try {
  // Tenta matar o processo de forma forçada
  console.log(`Tentando matar o processo ${processName}...`);
  execSync(`taskkill /F /IM "${processName}"`, { windowsHide: true });
  console.log('Processo terminado com sucesso.');
} catch (error) {
  if (error.status === 128) {
    console.log(`Processo ${processName} não encontrado. Nada a fazer.`);
  } else {
    console.error(`Erro ao tentar matar o processo: ${error.message}`);
  }
}

// Garantir que o diretório build existe
const buildPath = path.join(__dirname, '../build');
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath, { recursive: true });
}

console.log('Pronto para compilar uma nova versão.');