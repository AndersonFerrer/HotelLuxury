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