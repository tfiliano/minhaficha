!include nsProcess.nsh

!macro customInit
  ; Verifica se o aplicativo está em execução
  ${nsProcess::FindProcess} "Minha Ficha - Print Service.exe" $R0
  ${If} $R0 == 0
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "O aplicativo Minha Ficha - Print Service está em execução. Clique em OK para fechá-lo e continuar a instalação." IDOK killProcess IDCANCEL abortInstall
    
    killProcess:
      ; Tenta fechar o processo graciosamente primeiro
      ${nsProcess::KillProcess} "Minha Ficha - Print Service.exe" $R0
      Sleep 1000
      ${nsProcess::FindProcess} "Minha Ficha - Print Service.exe" $R0
      ${If} $R0 == 0
        ; Se ainda estiver rodando, força o encerramento
        ${nsProcess::KillProcess} "Minha Ficha - Print Service.exe" $R0
        Sleep 1500
      ${EndIf}
      Goto continue
      
    abortInstall:
      Abort "A instalação foi cancelada."
      
    continue:
  ${EndIf}
  
  ; Libera o nsProcess
  ${nsProcess::Unload}
!macroend

!macro customUnInit
  ; Espere um pouco para garantir que o processo foi encerrado
  Sleep 2000
!macroend