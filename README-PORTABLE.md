# 🚗 Carwash Peña Blanca - Aplicación Portable

## ✨ ¿Qué es esto?

Esta es una versión **completamente portable** del sistema de gestión del Carwash Peña Blanca. Significa que puedes copiar un solo archivo `.exe` a cualquier computadora Windows y funcionará sin necesidad de instalar nada más.

## 🎯 Características

- **✅ Sin instalación**: Solo ejecuta el archivo .exe
- **✅ Sin internet**: Funciona completamente offline  
- **✅ Sin dependencias**: No necesitas instalar Node.js, npm, ni nada
- **✅ Datos seguros**: Toda la información se guarda localmente
- **✅ Portable**: Copia el archivo a una USB y úsalo en cualquier PC
- **✅ Base de datos incluida**: SQLite integrado

## 📁 ¿Cómo usar?

### Para crear la aplicación portable:

1. En tu computadora de desarrollo, ejecuta:
   ```bash
   node build-portable.js
   ```

2. Esto creará un archivo llamado `CarwashPenaBlanca-Portable.exe` en la carpeta `dist/`

### Para usar en otra computadora:

1. Copia el archivo `CarwashPenaBlanca-Portable.exe` 
2. Pégalo en cualquier carpeta de la nueva computadora
3. Haz doble clic para ejecutar
4. ¡Listo! El sistema abrirá automáticamente

## 💾 ¿Dónde se guardan los datos?

Los datos se guardan automáticamente en:
- **Windows**: `C:\\Users\\[TuUsuario]\\AppData\\Roaming\\CarwashPenaBlanca\\`
- Se crea una base de datos SQLite llamada `carwash.db`
- Todos los datos (facturas, clientes, inventario) quedan guardados ahí

## 🔧 Funciones incluidas

- ✅ Dashboard con estadísticas
- ✅ Facturación completa
- ✅ Gestión de inventario  
- ✅ Sistema CRM de clientes
- ✅ Citas y programación
- ✅ Reportes y Excel
- ✅ Impresión térmica
- ✅ Todo funciona offline

## 🆘 Solución de problemas

**Si no abre la aplicación:**
- Asegúrate de tener Windows 10 o superior
- Algunos antivirus pueden bloquear aplicaciones nuevas - agrégala a excepciones

**Si pierdes datos:**
- Los datos están en la carpeta mencionada arriba
- Puedes hacer backup copiando la carpeta completa

**Para transferir datos entre computadoras:**
- Copia la carpeta `CarwashPenaBlanca` completa del AppData
- Pégala en la misma ubicación en la nueva PC

## 🎉 ¡Ya está!

Con esta aplicación portable puedes:
- Llevarte el sistema en una USB
- Instalarlo en múltiples computadoras sin problemas
- Trabajar sin conexión a internet
- No preocuparte por actualizaciones de Node.js o dependencias
- Tener tu propio sistema de gestión profesional

**¡Simple, rápido y funcional!** 🚀