# Carwash Management System - Java Version

## Descripción
Sistema de gestión integral para carwash "Peña Blanca" desarrollado en Java con JavaFX y Spring Boot.

## Características Principales
- **Aplicación de escritorio** con JavaFX (NO requiere navegador)
- **Base de datos PostgreSQL** para persistencia de datos
- **Interfaz moderna** con CSS personalizado
- **Gestión completa** de citas, clientes, servicios e inventario
- **Reportes y estadísticas** en tiempo real
- **Facturación integrada** con generación de PDF
- **Sistema CRM** para gestión de clientes

## Tecnologías Utilizadas
- **Java 17** - Lenguaje principal
- **JavaFX 21** - Interfaz gráfica de usuario
- **Spring Boot 3.2** - Framework backend
- **Spring Data JPA** - Acceso a datos
- **PostgreSQL** - Base de datos
- **Maven** - Gestión de dependencias
- **iText 7** - Generación de PDFs
- **Apache POI** - Exportación a Excel

## Estructura del Proyecto
```
java-version/
├── src/main/java/com/carwash/
│   ├── CarwashApplication.java          # Aplicación principal
│   ├── model/                           # Entidades JPA
│   │   ├── Service.java
│   │   ├── Customer.java
│   │   ├── Appointment.java
│   │   └── ...
│   ├── repository/                      # Repositorios Spring Data
│   │   ├── ServiceRepository.java
│   │   ├── CustomerRepository.java
│   │   └── ...
│   ├── service/                         # Servicios de negocio
│   │   ├── CarwashService.java
│   │   ├── CustomerService.java
│   │   └── ...
│   └── ui/                             # Interfaz JavaFX
│       ├── CarwashMainApplication.java
│       └── controller/
│           └── MainController.java
├── src/main/resources/
│   ├── fxml/                           # Archivos FXML
│   │   ├── main.fxml
│   │   ├── dashboard.fxml
│   │   └── ...
│   ├── css/
│   │   └── styles.css                  # Estilos CSS
│   └── application.properties          # Configuración
└── pom.xml                             # Dependencias Maven
```

## Funcionalidades

### 🏠 Dashboard
- Estadísticas en tiempo real
- Citas del día
- Clientes recientes
- Alertas de stock bajo

### 📅 Gestión de Citas
- Crear, editar y eliminar citas
- Vista de calendario
- Estados de citas (programada, confirmada, completada, etc.)
- Búsqueda y filtros avanzados

### 👥 Gestión de Clientes (CRM)
- Registro completo de clientes
- Historial de servicios
- Búsqueda por nombre, teléfono o email
- Seguimiento de gastos totales

### 🔧 Gestión de Servicios
- Catálogo de servicios con precios
- Duración estimada de servicios
- Activación/desactivación de servicios

### 📦 Control de Inventario
- Registro de productos y materiales
- Control de stock mínimo
- Alertas de inventario bajo
- Códigos de barras

### 🧾 Facturación
- Generación automática de facturas
- Exportación a PDF
- Control de pagos
- Historial de facturas

### 📈 Reportes
- Ingresos por período
- Servicios más populares
- Análisis de clientes
- Exportación a Excel

## Requisitos del Sistema
- Java 17 o superior
- PostgreSQL 12 o superior
- Mínimo 512MB RAM
- 100MB espacio en disco

## Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd java-version
```

### 2. Configurar Base de Datos
```sql
-- Crear base de datos PostgreSQL
CREATE DATABASE carwash_db;
CREATE USER carwash_user WITH PASSWORD 'carwash_password';
GRANT ALL PRIVILEGES ON DATABASE carwash_db TO carwash_user;
```

### 3. Configurar aplicación
Editar `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/carwash_db
spring.datasource.username=carwash_user
spring.datasource.password=carwash_password
```

### 4. Compilar y ejecutar
```bash
mvn clean compile
mvn spring-boot:run
```

## Compilación de Ejecutable

### Generar JAR ejecutable
```bash
mvn clean package
```

### Crear ejecutable nativo (opcional)
```bash
# Usando jpackage (Java 14+)
jpackage --input target/ \
         --name "Carwash-Management" \
         --main-jar carwash-management-1.0.0.jar \
         --main-class com.carwash.CarwashApplication \
         --type exe
```

## Configuración Inicial

### Datos de Ejemplo
Al ejecutar por primera vez, el sistema creará:
- 5 servicios predeterminados
- Inventario básico
- Usuario administrador (admin/admin123)

### Cambiar Credenciales
Editar en `application.properties`:
```properties
spring.security.user.name=tu_usuario
spring.security.user.password=tu_password
```

## Uso de la Aplicación

### 1. Inicio
- La aplicación se ejecuta como aplicación de escritorio
- No requiere navegador web
- Se conecta automáticamente a la base de datos

### 2. Navegación
- **Menú lateral** para acceder a diferentes módulos
- **Dashboard** muestra resumen general
- **Estadísticas en tiempo real** en la barra lateral

### 3. Gestión Diaria
1. Revisar citas del día en Dashboard
2. Agregar nuevas citas según demanda
3. Actualizar estado de citas completadas
4. Generar facturas para servicios prestados

## Ventajas de la Versión Java

### ✅ Aplicación de Escritorio Nativa
- No depende de navegador web
- Mejor rendimiento que aplicaciones web
- Interfaz más responsiva

### ✅ Base de Datos Robusta
- PostgreSQL para máxima confiabilidad
- Respaldo automático de datos
- Escalabilidad empresarial

### ✅ Instalación Simple
- Ejecutable único (.jar o .exe)
- Auto-configuración de base de datos
- Sin dependencias web

### ✅ Multiplataforma
- Funciona en Windows, Mac y Linux
- Misma experiencia en todas las plataformas

## Soporte y Mantenimiento
- Actualizaciones automáticas de esquema de BD
- Logs detallados para troubleshooting
- Configuración centralizada en application.properties

## Migración desde Versión Node.js
Los datos se pueden migrar fácilmente:
1. Exportar datos desde PostgreSQL actual
2. Importar en nueva instancia
3. El esquema es compatible entre versiones

---

**Versión**: 1.0.0  
**Desarrollado para**: Carwash Peña Blanca  
**Tecnología**: Java + JavaFX + Spring Boot + PostgreSQL