# 🖥️ CREAR ACCESO DIRECTO SIN VENTANA CMD

## ✅ SOLUCIÓN DEFINITIVA - SIN VENTANA NEGRA

### OPCIÓN 1: Usar archivo VBScript (RECOMENDADO)
1. **Hacer doble clic en:** `CarwashPenaBlanca.vbs`
2. **¡LISTO!** Se abre directo sin CMD

### OPCIÓN 2: Crear Acceso Directo Personalizado
1. **Clic derecho en escritorio** → Nuevo → Acceso directo
2. **Ubicación del programa:** 
   ```
   wscript.exe "RUTA-COMPLETA\CarwashPenaBlanca.vbs"
   ```
3. **Nombre:** Sistema Peña Blanca
4. **¡Doble clic y funciona como programa normal!**

### OPCIÓN 3: Launcher con Node.js
1. **Doble clic en:** `SISTEMA-INVISIBLE.bat`
2. **Se ejecuta y cierra CMD automáticamente**

## 🎯 COMPORTAMIENTO ESPERADO

### ✅ LO QUE VAS A VER:
- Mensaje: "Iniciando Sistema de Lavado Peña Blanca..."
- Navegador se abre automáticamente
- **NO se ve ventana CMD negra**
- Funciona como programa normal de Windows

### ❌ LO QUE NO VAS A VER:
- Ventana negra de CMD
- Líneas de código corriendo
- Ventanas técnicas

## 🚀 INSTRUCCIONES PASO A PASO

### Para Crear Acceso Directo Perfecto:
1. **Copiar ruta completa de tu carpeta** 
   - Ejemplo: `C:\Users\TuNombre\Desktop\CarwashPenaBlanca\`

2. **Clic derecho en escritorio** → Nuevo → Acceso directo

3. **Escribir en "Ubicación":**
   ```
   wscript.exe "C:\Users\TuNombre\Desktop\CarwashPenaBlanca\CarwashPenaBlanca.vbs"
   ```

4. **Nombre del acceso directo:** 
   ```
   🚗 Sistema Peña Blanca
   ```

5. **¡Doble clic en el acceso directo = programa funcionando!**

## 💡 VENTAJAS DE ESTA SOLUCIÓN

- ✅ **Sin ventana CMD visible**
- ✅ **Se comporta como programa normal**
- ✅ **Acceso directo en escritorio**
- ✅ **Inicio automático del navegador**
- ✅ **Mensajes informativos amigables**
- ✅ **Fácil de cerrar**

## 🔧 PARA CERRAR EL PROGRAMA

### Método 1: Cerrar navegador y...
- **Ctrl+Alt+Supr** → Administrador de tareas
- Buscar "node.exe" → Finalizar tarea

### Método 2: Script de cierre
- Crear archivo `CERRAR-SISTEMA.bat`:
```batch
@echo off
taskkill /f /im node.exe
echo Sistema Peña Blanca cerrado
pause
```

---
**RESULTADO:** Tu sistema funcionará exactamente como cualquier programa de Windows, sin ventanas técnicas visibles.