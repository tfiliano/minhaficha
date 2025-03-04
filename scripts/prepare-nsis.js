const fs = require('fs');
const path = require('path');

// Cria diretório se não existir
const nsisPath = path.join(__dirname, '../build/nsis');
if (!fs.existsSync(nsisPath)){
    fs.mkdirSync(nsisPath, { recursive: true });
}

// Verifica se os arquivos do nsProcess existem
const nsProcessNsh = path.join(nsisPath, 'nsProcess.nsh');
const nsProcessDll = path.join(nsisPath, 'nsProcess.dll');

if (!fs.existsSync(nsProcessNsh) || !fs.existsSync(nsProcessDll)) {
    console.log('AVISO: Arquivos nsProcess não encontrados!');
    console.log('Por favor, baixe manualmente nsProcess.nsh e nsProcess.dll');
    console.log('e coloque-os no diretório build/nsis/');
}

// Cria ou atualiza o arquivo installer.nsh na raiz do projeto
const installerNshContent = `!include nsProcess.nsh

!macro customInit
  ; Verifica se o aplicativo está em execução
  \${nsProcess::FindProcess} "Minha Ficha - Print Service.exe" $R0
  \${If} $R0 == 0
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "O aplicativo Minha Ficha - Print Service está em execução. Clique em OK para fechá-lo e continuar a instalação." IDOK killProcess IDCANCEL abortInstall
    
    killProcess:
      ; Tenta fechar o processo graciosamente primeiro
      \${nsProcess::KillProcess} "Minha Ficha - Print Service.exe" $R0
      Sleep 1000
      \${nsProcess::FindProcess} "Minha Ficha - Print Service.exe" $R0
      \${If} $R0 == 0
        ; Se ainda estiver rodando, força o encerramento
        \${nsProcess::KillProcess} "Minha Ficha - Print Service.exe" $R0
        Sleep 1500
      \${EndIf}
      Goto continue
      
    abortInstall:
      Abort "A instalação foi cancelada."
      
    continue:
  \${EndIf}
  
  ; Libera o nsProcess
  \${nsProcess::Unload}
!macroend

!macro customUnInit
  ; Espere um pouco para garantir que o processo foi encerrado
  Sleep 2000
!macroend`;

// Escreve o arquivo installer.nsh na raiz do projeto
const installerNshPath = path.join(__dirname, '../installer.nsh');
try {
    fs.writeFileSync(installerNshPath, installerNshContent, 'utf8');
    console.log('Arquivo installer.nsh criado/atualizado com sucesso na raiz do projeto.');
} catch (error) {
    console.error('Erro ao criar o arquivo installer.nsh:', error);
}

// Também escreve para o diretório de build por precaução
const buildInstallerNshPath = path.join(__dirname, '../build/installer.nsh');
try {
    fs.writeFileSync(buildInstallerNshPath, installerNshContent, 'utf8');
    console.log('Arquivo installer.nsh criado/atualizado com sucesso no diretório build.');
} catch (error) {
    console.error('Erro ao criar o arquivo installer.nsh no diretório build:', error);
}