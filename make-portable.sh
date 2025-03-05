#!/bin/bash
set -e

echo "=== Criando versão portátil do Minha Ficha - Print Service ==="

# Verificar se a pasta dist existe
if [ ! -d "dist" ]; then
  echo "Criando pasta dist..."
  mkdir -p dist
fi

# Compilar a aplicação Electron para Windows
echo "Compilando aplicação Electron para Windows..."
npm run build:win-files

# Criar estrutura da versão portátil
echo "Criando estrutura portátil..."
mkdir -p dist/MinhaFicha-PrintService-Portable
cp -r dist/win-unpacked/* dist/MinhaFicha-PrintService-Portable/

# Criar launcher.bat
echo "Criando launcher..."
cat > dist/MinhaFicha-PrintService-Portable/MinhaFicha-PrintService.bat << 'EOF'
@echo off
echo Iniciando Minha Ficha - Print Service...
start "" "%~dp0Minha Ficha - Print Service.exe"
EOF

# Criar arquivo leiame.txt
cat > dist/MinhaFicha-PrintService-Portable/leiame.txt << 'EOF'
Minha Ficha - Print Service (Versão Portátil)
=============================================

Esta é a versão portátil do Minha Ficha - Print Service.
Para iniciar o aplicativo, execute o arquivo "MinhaFicha-PrintService.bat".

Observações:
- Esta versão não requer instalação
- Pode ser executada de pendrive ou qualquer pasta local
- Não cria atalhos no menu iniciar ou área de trabalho
- Pode ser removida simplesmente excluindo esta pasta

Suporte: suporte@minhaficha.com.br
EOF

# Compactar em ZIP
echo "Criando arquivo ZIP..."
cd dist
zip -r MinhaFicha-PrintService-Portable.zip MinhaFicha-PrintService-Portable

echo "=== Versão portátil criada com sucesso! ==="
echo "Arquivo: dist/MinhaFicha-PrintService-Portable.zip"