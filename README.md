# 🏨 Sistema de Reservas - Luxury Hotel

Sistema completo de gestión hotelera con funcionalidades de reservas, autenticación de usuarios y panel administrativo.

## 📋 Características Principales

### 🔐 Autenticación y Usuarios
- **Login unificado** para clientes y empleados
- **Registro de clientes** con validaciones completas
- **Redirección automática** según tipo de usuario
- **Gestión de sesiones** segura
- **Sistema de protección de rutas** completo

### 🛡️ Sistema de Protección de Rutas
- **Verificación automática** de autenticación en todas las páginas
- **Redireccionamiento inteligente** según tipo de usuario
- **Protección de rutas privadas** para clientes y empleados
- **Control de acceso** a funcionalidades específicas
- **UI dinámica** que se adapta al estado de autenticación

#### Rutas Configuradas:
- **Públicas**: `/`, `/index.html`, `/auth.html`, `/contact.html`, `/room-detail.html`
- **Cliente**: `/mi-cuenta.html`
- **Empleado**: `/admin-page.html`, `/pagesAdmin/*`

#### Comportamiento de Redireccionamiento:
- **No autenticado** en ruta privada → Redirige a `/auth.html`
- **Cliente** en ruta de empleado → Redirige a `/`
- **Empleado** en ruta pública/cliente → Redirige a `/admin-page.html`
- **Cliente** en ruta de cliente → Permite acceso
- **Empleado** en ruta de empleado → Permite acceso

### 🏠 Gestión de Habitaciones
- **Catálogo de habitaciones** con tipos y características
- **Estados de habitaciones** (Disponible, Ocupada, Mantenimiento)
- **CRUD completo** para administradores
- **Modales de detalle y edición**

### 📅 Sistema de Reservas
- **Reservas por clientes** autenticados
- **Validación de disponibilidad** y conflictos de fechas
- **Estados de reserva** completos:
  - `Pendiente` → `Confirmada` → `Activa` → `Completada`
  - `Cancelada` (en cualquier momento)
- **Gestión administrativa** completa

### 👨‍💼 Panel Administrativo
- **Dashboard** con estadísticas en tiempo real
- **Gestión de reservas** con acciones por estado
- **Gestión de habitaciones** completa
- **Filtros y búsquedas**

## 🚀 Instalación

### Requisitos Previos
- PHP 8.0 o superior
- PostgreSQL 12 o superior
- Composer
- Servidor web (Apache/Nginx)

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd proyecto
```

### 2. Instalar Dependencias
```bash
composer install
```

### 3. Configurar Base de Datos
```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luxury_hotel
DB_USER=tu_usuario
DB_PASS=tu_contraseña
APP_DEBUG=true
TIMEZONE=America/Lima
```

### 4. Crear Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE luxury_hotel;

-- Ejecutar script de tablas
\i tablas.sql

-- Insertar datos de prueba
\i mockupData.sql
```

### 5. Configurar Servidor Web
Configurar el servidor web para que apunte al directorio del proyecto.

## 🔧 Configuración

### Variables de Entorno
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de PostgreSQL
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASS`: Contraseña de la base de datos
- `APP_DEBUG`: Modo debug (true/false)
- `TIMEZONE`: Zona horaria

### Permisos de Archivos
```bash
chmod 755 -R /ruta/al/proyecto
chmod 644 .env
```

## 📖 Uso del Sistema

### 👤 Clientes

#### 1. Registro
- Acceder a `/auth.html`
- Completar formulario de registro
- Validaciones automáticas de datos

#### 2. Inicio de Sesión
- Usar correo y contraseña registrados
- Redirección automática al home

#### 3. Realizar Reserva
- Navegar a habitación deseada
- Seleccionar fechas y habitación específica
- Completar formulario de reserva
- Reserva se crea en estado "Pendiente"

#### 4. Acceso a Mi Cuenta
- Solo clientes autenticados pueden acceder a `/mi-cuenta.html`
- Ver reservas personales y gestionar perfil

### 👨‍💼 Empleados

#### 1. Acceso Administrativo
- Iniciar sesión con credenciales de empleado
- Redirección automática al panel admin

#### 2. Gestión de Reservas
- **Ver reservas pendientes** en `/admin-page.html#reservas`
- **Confirmar reservas**: Cambia estado a "Confirmada"
- **Realizar check-in**: Cambia estado a "Activa"
- **Realizar check-out**: Cambia estado a "Completada"
- **Rechazar/Cancelar**: Cambia estado a "Cancelada"

#### 3. Gestión de Habitaciones
- **Ver todas las habitaciones** en `/admin-page.html#habitaciones`
- **Agregar habitaciones** nuevas
- **Editar estados** y tipos
- **Eliminar habitaciones** (con confirmación)

## 🔄 Flujo Completo de Reservas

### 1. Creación de Reserva (Cliente)
```
Cliente autenticado → Selecciona habitación → Fechas → Confirma → Estado: Pendiente
```

### 2. Gestión Administrativa (Empleado)
```
Pendiente → [Confirmar] → Confirmada → [Check-in] → Activa → [Check-out] → Completada
     ↓
  [Rechazar/Cancelar] → Cancelada
```

### 3. Estados de Habitación
```
Disponible ←→ Ocupada ←→ Mantenimiento
```

## 🛠️ Estructura del Proyecto

```
proyecto/
├── api/                    # Backend PHP
│   ├── auth/              # Autenticación
│   ├── habitaciones/      # Gestión de habitaciones
│   ├── reservas/          # Gestión de reservas
│   └── dashboard/         # Estadísticas
├── components/            # Componentes HTML reutilizables
├── pagesAdmin/           # Páginas del panel administrativo
├── scripts/              # JavaScript del frontend
│   ├── authService.js    # Servicios de autenticación
│   ├── routeProtection.js # Protección de rutas
│   └── publicPageProtection.js # Protección de páginas públicas
├── styles/               # Archivos CSS
├── vendor/               # Dependencias de Composer
└── index.html            # Página principal
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/auth/login.php` - Login unificado
- `POST /api/auth/register.php` - Registro de clientes
- `GET /api/auth/check-session.php` - Verificar sesión
- `POST /api/auth/logout.php` - Cerrar sesión

### Habitaciones
- `GET /api/habitaciones/listar.php` - Listar disponibles
- `GET /api/habitaciones/getAll.php` - Todas las habitaciones
- `GET /api/habitaciones/detalle.php?id=X` - Detalle de habitación
- `POST /api/habitaciones/insert.php` - Crear habitación
- `POST /api/habitaciones/update.php` - Actualizar habitación
- `DELETE /api/habitaciones/delete.php?id=X` - Eliminar habitación

### Reservas
- `GET /api/reservas/getAll.php` - Todas las reservas
- `GET /api/reservas/getByCliente.php` - Reservas del cliente autenticado
- `POST /api/reservas/insert.php` - Crear reserva
- `POST /api/reservas/confirmar.php` - Confirmar reserva
- `POST /api/reservas/rechazar.php` - Rechazar reserva
- `POST /api/reservas/cancelar.php` - Cancelar reserva
- `POST /api/reservas/activar.php` - Check-in
- `POST /api/reservas/completar.php` - Check-out

## 🧪 Datos de Prueba

### Usuarios de Prueba

#### Clientes
- **Email**: `juan.perez@email.com` / **Password**: `password`
- **Email**: `maria.rodriguez@email.com` / **Password**: `password`

#### Empleados
- **Email**: `ricardo.suarez@hotel.com` / **Password**: `password`
- **Email**: `carmen.gomez@hotel.com` / **Password**: `password`

### Estados de Reservas de Prueba
- **Reserva #9**: Pendiente (recién creada)
- **Reserva #10**: Confirmada (lista para check-in)
- **Reserva #11**: Activa (check-in realizado)
- **Reserva #12**: Completada (check-out realizado)
- **Reserva #13**: Cancelada

## 🔒 Seguridad

- **Validación de sesiones** en todos los endpoints administrativos
- **Sanitización de datos** de entrada
- **Transacciones de base de datos** para operaciones críticas
- **Validaciones de permisos** por tipo de usuario
- **Protección contra CSRF** en formularios
- **Sistema de protección de rutas** completo
- **Redireccionamiento automático** según permisos

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
- Verificar credenciales en `.env`
- Comprobar que PostgreSQL esté ejecutándose
- Verificar permisos de usuario

### Error de Sesión
- Verificar configuración de PHP sessions
- Comprobar permisos de escritura en directorio temporal

### Error de CORS
- Verificar configuración del servidor web
- Comprobar headers en archivos PHP

### Problemas de Redireccionamiento
- Verificar que las rutas estén configuradas en `authService.js`
- Comprobar que los scripts de protección estén incluidos
- Revisar la consola del navegador para errores

## 📝 Notas de Desarrollo

- El sistema usa **PHP vanilla** con **PDO** para base de datos
- **JavaScript ES6+** para el frontend
- **CSS Grid/Flexbox** para layouts responsivos
- **PostgreSQL** como base de datos principal
- **Sistema modular** de protección de rutas

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Luxury Hotel** 