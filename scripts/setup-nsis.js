const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

// URLs para download dos arquivos nsProcess
const NSPROCESS_NSH_URL = 'https://nsis.sourceforge.io/mediawiki/images/d/d3/Nsprocess.nsh';
const NSPROCESS_DLL_URL = 'https://nsis.sourceforge.io/mediawiki/images/1/1c/Nsprocess.dll';

// Caminho para o diretório de destino
const nsisPath = path.join(__dirname, '../build/nsis');

// Cria o diretório se não existir
if (!fs.existsSync(nsisPath)) {
  console.log('Criando diretório build/nsis...');
  fs.mkdirSync(nsisPath, { recursive: true });
}

// Função para baixar arquivo
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Baixando ${url} para ${destination}...`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Download concluído: ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Deleta o arquivo parcial
      reject(err);
    });
  });
}

// Função para copiar o installer.nsh para o diretório certo
function copyInstallerNsh() {
  // O arquivo installer.nsh deve estar na raiz do projeto
  const source = path.join(__dirname, '../installer.nsh');
  const dest = path.join(__dirname, '../build/installer.nsh');
  
  try {
    if (fs.existsSync(source)) {
      console.log('Copiando installer.nsh...');
      fs.copyFileSync(source, dest);
      console.log('installer.nsh copiado com sucesso.');
    } else {
      console.error('ERRO: installer.nsh não encontrado na raiz do projeto.');
      console.error('Por favor, crie o arquivo installer.nsh antes de continuar.');
    }
  } catch (err) {
    console.error('Erro ao copiar installer.nsh:', err);
  }
}

// Baixa os arquivos nsProcess se não existirem
async function downloadNsProcess() {
  const nsProcessNsh = path.join(nsisPath, 'nsProcess.nsh');
  const nsProcessDll = path.join(nsisPath, 'nsProcess.dll');
  
  try {
    if (!fs.existsSync(nsProcessNsh)) {
      await downloadFile(NSPROCESS_NSH_URL, nsProcessNsh);
    } else {
      console.log('nsProcess.nsh já existe.');
    }
    
    if (!fs.existsSync(nsProcessDll)) {
      await downloadFile(NSPROCESS_DLL_URL, nsProcessDll);
    } else {
      console.log('nsProcess.dll já existe.');
    }
    
    // Também copia os arquivos para o diretório raiz/build para garantir que o NSIS os encontrará
    const rootNsisDir = path.join(__dirname, '../build');
    if (!fs.existsSync(rootNsisDir)) {
      fs.mkdirSync(rootNsisDir, { recursive: true });
    }
    
    // Copia os arquivos
    fs.copyFileSync(nsProcessNsh, path.join(rootNsisDir, 'nsProcess.nsh'));
    fs.copyFileSync(nsProcessDll, path.join(rootNsisDir, 'nsProcess.dll'));
    
    console.log('Configuração do NSIS concluída com sucesso!');
  } catch (err) {
    console.error('Erro ao baixar arquivos nsProcess:', err);
    console.error('Por favor, baixe manualmente nsProcess.nsh e nsProcess.dll');
    console.error('e coloque-os no diretório build/nsis/');
  }
}

// Executa as funções
(async () => {
  try {
    await downloadNsProcess();
    copyInstallerNsh();
  } catch (err) {
    console.error('Erro durante a configuração:', err);
    process.exit(1);
  }
})();