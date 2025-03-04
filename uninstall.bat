@echo off
echo Fechando processos do aplicativo...
taskkill /f /im "Minha Ficha - Gerenciador de Impressao.exe" 2>nul
timeout /t 2 /nobreak >nul

echo Removendo aplicativo...
wmic product where "name like 'Minha Ficha - Gerenciador de Impressao%%'" call uninstall /nointeractive

echo Limpando arquivos residuais...
rd /s /q "%APPDATA%\Minha Ficha - Gerenciador de Impressao" 2>nul
rd /s /q "%LOCALAPPDATA%\Minha Ficha - Gerenciador de Impressao" 2>nul

echo Limpeza concluída!
pause