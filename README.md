# 🏨 Sistema de Reservas - Luxury Hotel

Sistema completo de gestión hotelera con funcionalidades de reservas, autenticación de usuarios y panel administrativo.

## 📋 Características Principales

Este documento incluye tanto el **Manual Técnico** para desarrolladores como el **Manual de Usuario** para empleados y clientes. Se detallan rutas, funcionalidades, paneles, autenticación y estructura del sistema.

---

# 🛠️ Manual Técnico

## Instalación y Puesta en Marcha

### 1. Requisitos
- PHP 8.0 o superior
- PostgreSQL 12 o superior
- Composer
- Servidor web (Apache/Nginx)

### 2. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd proyecto
```

### 3. Instalar Dependencias
```bash
composer install
```

### 4. Configurar Variables de Entorno
```bash
cp .env.example .env
```
Editar `.env` con tus credenciales:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luxury_hotel
DB_USER=tu_usuario
DB_PASS=tu_contraseña
APP_DEBUG=true
TIMEZONE=America/Lima
```

### 5. Crear Base de Datos
```sql
CREATE DATABASE luxury_hotel;
\i tablas.sql
\i mockupData.sql
```

### 6. Configurar el Servidor Web
Apuntar el DocumentRoot al directorio del proyecto.

### 7. Permisos de Archivos
```bash
chmod 755 -R /ruta/al/proyecto
chmod 644 .env
```

## Estructura del Proyecto

```
proyecto/
├── api/                # Endpoints PHP (habitaciones, reservas, auth, etc)
├── assets/             # Imágenes y recursos
├── components/         # Componentes HTML reutilizables
├── pagesAdmin/         # Páginas del panel administrativo
├── scripts/            # JavaScript frontend (admin y público)
├── styles/             # CSS
├── vendor/             # Composer
├── index.html          # Página principal
├── auth.html           # Login y registro
├── mi-cuenta.html      # Perfil cliente
├── room-detail.html    # Detalle de habitación
└── ...
```

- **pagesAdmin/**: HTMLs para dashboard, habitaciones, tipos, empleados, clientes, reservas.
- **scripts/**: Lógica JS para cada sección (ej: `habitacionesAdmin.js`, `booking-form.js`, `router.js`).
- **api/**: Endpoints RESTful para CRUD y lógica de negocio.

## Sistema de Routing y Carga Dinámica
- Navegación basada en hash (SPA-like):
  - El archivo `scripts/router.js` gestiona rutas y carga dinámica de HTML, CSS y JS según la ruta.
  - Admin: `/admin-page.html#dashboard`, `/admin-page.html#habitaciones`, etc.
  - Cliente: `/mi-cuenta.html`, `/room-detail.html`.

## Endpoints de la API

### Autenticación
- `POST /api/auth/login.php` - Login unificado
- `POST /api/auth/register.php` - Registro de clientes
- `GET /api/auth/check-session.php` - Verificar sesión
- `POST /api/auth/logout.php` - Cerrar sesión

### Habitaciones
- `GET /api/habitaciones/listar.php` - Listar disponibles
- `GET /api/habitaciones/getAll.php` - Todas las habitaciones
- `GET /api/habitaciones/detalle.php?id=X` - Detalle de habitación
- `GET /api/habitaciones/detalle_tipo.php?id_tipo=X` - Detalle de tipo + disponibles
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

### Tipos y Características
- `GET /api/tipos/listar.php`, `POST /api/tipos/insert.php`, ...
- `GET /api/caracteristicas/listar.php`, ...

### Empleados y Clientes
- `GET /api/empleados/listar.php`, `POST /api/empleados/insert.php`, ...
- `GET /api/huespedes/listar.php`, ...

(Ver `/api/` para el listado completo de endpoints)

### Pruebas y Debug
- Usuarios y reservas de prueba incluidas en `mockupData.sql`.

---

# 👥 Manual de Usuario

## Roles y Permisos

| Rol      | Acceso a Panel Admin | Reservas | Gestión de Habitaciones | Gestión de Usuarios |
|----------|:-------------------:|:--------:|:----------------------:|:-------------------:|
| Cliente  | ❌                  | ✔️       | ❌                     | Puede editar su perfil |
| Empleado | ✔️                  | ✔️       | ✔️                     | CRUD empleados/clientes |

- **Clientes**: Pueden registrarse, iniciar sesión, reservar, ver y editar su cuenta.
- **Empleados**: Acceso a panel admin, gestión completa de habitaciones, reservas, empleados, clientes, tipos y características.

## Rutas y Navegación

### Públicas
- `/`, `/index.html` — Página principal, catálogo de habitaciones.
- `/auth.html` — Login y registro.
- `/contact.html` — Contacto.
- `/room-detail.html?id=...` — Detalle de tipo de habitación.

### Cliente
- `/mi-cuenta.html` — Perfil y reservas personales.

### Admin (Empleado)
- `/admin-page.html#dashboard` — Dashboard con estadísticas y últimas reservas.
- `/admin-page.html#habitaciones` — CRUD habitaciones.
- `/admin-page.html#tipos-caracteristicas` — CRUD tipos y características.
- `/admin-page.html#empleados` — CRUD empleados.
- `/admin-page.html#clientes` — Listado y detalle de clientes.
- `/admin-page.html#reservas` — Gestión de reservas.

## Panel Administrativo (Empleado)

- **Dashboard**: Estadísticas en tiempo real, últimas 5 reservas.
- **Habitaciones**: CRUD, estados, modales de detalle y edición.
- **Tipos y Características**: CRUD, filtrado, asignación de características.
- **Empleados**: Listado, detalle, registro de empleados.
- **Clientes**: Listado, detalle (sin creación desde admin).
- **Reservas**: Ver, filtrar, confirmar, rechazar, cancelar, check-in/out.

## Vistas Cliente
- **Catálogo**: Listado de tipos de habitación, detalles, galería.
- **Detalle de Habitación**: `/room-detail.html?id=...` muestra info de tipo, características, habitaciones disponibles y formulario de reserva.
- **Mi Cuenta**: Editar datos, ver reservas, cancelar si está permitido.

## Autenticación y Protección de Rutas
- **Login unificado** (clientes y empleados).
- **Registro** solo para clientes.
- **Protección de rutas**: Redirección automática según tipo de usuario y ruta.
- **Gestión de sesión**: Validación y expiración segura.

## Flujo de Navegación (SPA-like)
- Navegación hash-based (`#dashboard`, `#habitaciones`, etc.)
- El router JS carga dinámicamente el HTML, CSS y JS de cada sección.
- Scripts principales: `router.js`, `authService.js`, `routeProtection.js`.

## Ejemplo de Uso
- Cliente navega a `/`, selecciona tipo de habitación, consulta detalle, reserva.
- Empleado inicia sesión, accede a `/admin-page.html`, gestiona habitaciones, reservas, empleados, etc.

## (Opcional) Capturas de Pantalla y Diagramas
- Se recomienda agregar capturas de las vistas principales y diagramas de flujo en la carpeta `/assets/` para mayor claridad.

---

# 🐛 Solución de Problemas

- **Error de Conexión a Base de Datos**: Revisar `.env` y estado de PostgreSQL.
- **Error de Sesión**: Revisar configuración PHP y permisos.
- **Error de CORS**: Configuración de servidor y headers en PHP.
- **Redireccionamiento Incorrecto**: Revisar scripts y consola del navegador.

# 📝 Notas de Desarrollo
- PHP vanilla + PDO
- JS ES6+, SPA-like hash routing
- PostgreSQL
- Modularidad y protección de rutas

---

**Desarrollado con ❤️ para Luxury Hotel**


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