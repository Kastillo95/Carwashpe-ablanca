#!/usr/bin/env python3
"""
Launcher script para la versión Python del Sistema de Lavado Peña Blanca
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🔧 Iniciando Sistema de Lavado Peña Blanca (Python)...")
    
    # Cambiar al directorio de la aplicación Python
    os.chdir("python_app")
    
    # Ejecutar la aplicación
    try:
        subprocess.run([
            sys.executable, "main.py"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Sistema detenido por el usuario")
    except Exception as e:
        print(f"❌ Error al ejecutar el sistema: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())