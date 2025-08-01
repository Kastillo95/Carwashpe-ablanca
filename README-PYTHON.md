# Sistema de Lavado Peña Blanca - Versión Python

## Descripción
Esta es la versión completamente convertida a Python del Sistema de Lavado Peña Blanca. Utiliza FastAPI como framework web y SQLAlchemy como ORM para la base de datos.

## Tecnologías Utilizadas
- **Backend**: FastAPI (Python 3.11)
- **Base de datos**: SQLite con SQLAlchemy ORM
- **API**: RESTful API con documentación automática
- **Frontend**: Compatible con el frontend React existente
- **Validación**: Pydantic para validación de datos

## Estructura del Proyecto Python
```
python_app/
├── __init__.py          # Inicialización del módulo
├── main.py             # Aplicación principal FastAPI
├── database.py         # Modelos y configuración de base de datos
├── schemas.py          # Esquemas Pydantic para validación
└── crud.py            # Operaciones CRUD para base de datos
```

## Características
- ✅ **API completa**: Todos los endpoints del sistema original
- ✅ **Base de datos SQLite**: Almacenamiento local independiente
- ✅ **Modelos completos**: Products, Services, Customers, Appointments, Invoices
- ✅ **Validación de datos**: Esquemas Pydantic robustos
- ✅ **Dashboard**: Estadísticas en tiempo real
- ✅ **Documentación automática**: FastAPI genera docs en `/docs`
- ✅ **Datos de ejemplo**: Se inicializa automáticamente con datos de prueba

## Cómo ejecutar la versión Python

### Opción 1: Usar el launcher
```bash
python run_python.py
```

### Opción 2: Windows (doble click)
```
EJECUTAR-PYTHON.bat
```

### Opción 3: Directamente
```bash
cd python_app
python main.py
```

## URLs de la aplicación
- **Aplicación web**: http://localhost:8001
- **Documentación API**: http://localhost:8001/docs
- **API alternativa**: http://localhost:8001/redoc

## Endpoints principales
- `GET /api/dashboard/stats` - Estadísticas del dashboard
- `GET /api/inventory` - Lista de productos
- `GET /api/services` - Lista de servicios
- `GET /api/crm/customers` - Lista de clientes
- `GET /api/appointments` - Lista de citas
- `GET /api/invoices` - Lista de facturas

## Ventajas de la versión Python
1. **Simplicidad**: Python es más fácil de leer y mantener
2. **Documentación automática**: FastAPI genera docs interactivas
3. **Validación fuerte**: Pydantic valida todos los datos automáticamente
4. **Mejor rendimiento**: SQLAlchemy es muy eficiente
5. **Portabilidad**: Funciona en cualquier sistema con Python
6. **Ecosistema**: Acceso a todas las librerías de Python

## Base de datos
- **Archivo**: `carwash-python.db` (SQLite)
- **ORM**: SQLAlchemy con modelos completos
- **Migraciones**: Automáticas al iniciar la aplicación
- **Datos de ejemplo**: Se cargan automáticamente si la DB está vacía

## Compatibilidad
- ✅ Mantiene toda la funcionalidad del sistema original
- ✅ Mismos endpoints de API
- ✅ Misma estructura de datos
- ✅ Compatible con el frontend React existente
- ✅ Funciona offline completamente

## Desarrollo
La aplicación está lista para producción y incluye:
- Manejo de errores robusto
- Validación de datos completa
- Documentación automática
- Logging integrado
- Configuración flexible