Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtener directorio actual
currentDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Cambiar al directorio del script
objShell.CurrentDirectory = currentDir

' Verificar si Node.js está instalado
Set objExec = objShell.Exec("node --version")
nodeVersion = objExec.StdOut.ReadAll()

If objExec.ExitCode <> 0 Then
    MsgBox "Node.js no está instalado." & vbCrLf & vbCrLf & "Por favor instalar desde: https://nodejs.org", vbCritical, "Sistema Peña Blanca - Error"
    WScript.Quit
End If

' Verificar si las dependencias están instaladas
If Not objFSO.FolderExists(currentDir & "\node_modules") Then
    MsgBox "Instalando componentes del sistema..." & vbCrLf & "Esto puede tomar unos minutos la primera vez.", vbInformation, "Sistema Peña Blanca - Preparando"
    objShell.Run "cmd /c npm install", 0, True
End If

' Mostrar mensaje de inicio
MsgBox "Iniciando Sistema de Lavado Peña Blanca..." & vbCrLf & vbCrLf & "El navegador se abrirá automáticamente.", vbInformation, "Sistema Peña Blanca - Iniciando"

' Ejecutar npm run dev sin mostrar ventana CMD
objShell.Run "cmd /c npm run dev", 0, False

' Esperar 3 segundos y abrir navegador
WScript.Sleep 3000
objShell.Run "http://localhost:5000"

MsgBox "Sistema Peña Blanca está funcionando!" & vbCrLf & vbCrLf & "URL: http://localhost:5000" & vbCrLf & vbCrLf & "Para cerrar el sistema, termine el proceso desde el Administrador de Tareas.", vbInformation, "Sistema Peña Blanca - Activo"