# 🗺️ Diagrama de Flujo General - Luxury Hotel

Este diagrama de flujo describe el proceso principal de la aplicación Luxury Hotel, abarcando la experiencia de clientes y empleados, la autenticación, la navegación, y la gestión administrativa.

---

```mermaid
flowchart TD
    %% AUTENTICACIÓN Y ENTRADA
    Inicio([Inicio])
    Auth[¿Usuario autenticado?]
    TipoUser{¿Empleado o Cliente?}
    PaginaPublica[¿Ruta pública?]
    PaginaCliente[¿Ruta cliente?]
    PaginaAdmin[¿Ruta admin?]
    MostrarLogin[Mostrar Login/Registro]
    Registro[Registro Cliente]
    Login[Login Cliente/Empleado]
    RedirigeCliente[Redirige a /]
    RedirigeAdmin[Redirige a /admin-page.html]
    RedirigeAuth[Redirige a /auth.html]

    %% CLIENTE
    ClienteHome[Home Cliente / Catálogo]
    VerDetalle[Ver detalle habitación]
    ReservaForm[Completar reserva]
    ReservaCreada[Reserva creada (Pendiente)]
    MiCuenta[Mi Cuenta]
    VerReservas[Ver/gestionar reservas]

    %% EMPLEADO / ADMIN
    AdminHome[Dashboard Admin]
    GestionHabitaciones[Gestión Habitaciones]
    GestionTipos[Gestión Tipos/Características]
    GestionEmpleados[Gestión Empleados]
    GestionClientes[Gestión Clientes]
    GestionReservas[Gestión Reservas]

    %% FLUJO PRINCIPAL
    Inicio --> Auth
    Auth -- No --> MostrarLogin
    Auth -- Sí --> TipoUser
    MostrarLogin --> Login
    MostrarLogin --> Registro
    Registro --> ClienteHome
    Login --> TipoUser

    TipoUser -- Cliente --> PaginaCliente
    TipoUser -- Empleado --> PaginaAdmin

    PaginaCliente -- Sí --> ClienteHome
    PaginaCliente -- No --> RedirigeCliente
    PaginaAdmin -- Sí --> AdminHome
    PaginaAdmin -- No --> RedirigeAdmin
    PaginaPublica -- Sí --> Inicio
    PaginaPublica -- No --> RedirigeAuth

    %% CLIENTE
    ClienteHome --> VerDetalle
    VerDetalle --> ReservaForm
    ReservaForm --> ReservaCreada
    ClienteHome --> MiCuenta
    MiCuenta --> VerReservas

    %% ADMIN
    AdminHome --> GestionHabitaciones
    AdminHome --> GestionTipos
    AdminHome --> GestionEmpleados
    AdminHome --> GestionClientes
    AdminHome --> GestionReservas

    %% ACCIONES ADMIN
    GestionHabitaciones -->|CRUD| GestionHabitaciones
    GestionTipos -->|CRUD| GestionTipos
    GestionEmpleados -->|CRUD| GestionEmpleados
    GestionClientes -->|Ver Detalle| GestionClientes
    GestionReservas -->|Confirmar/Rechazar/Check-in/Check-out| GestionReservas

    %% ACCIONES CLIENTE
    VerReservas -->|Cancelar (si aplica)| VerReservas
```

---

## Explicación del Diagrama

- **Inicio**: El usuario accede a la aplicación. Se verifica autenticación y tipo de usuario.
- **Rutas protegidas**: El sistema redirige según el rol y la ruta (cliente/admin/pública).
- **Cliente**: Puede navegar por el catálogo, ver detalles, reservar, y gestionar su cuenta y reservas.
- **Empleado/Admin**: Accede al dashboard y a la gestión completa de habitaciones, tipos, empleados, clientes y reservas.
- **CRUD**: Todas las entidades administrativas permiten operaciones de creación, lectura, actualización y eliminación según permisos.
- **Reserva**: El flujo de reserva incluye selección de habitación, fechas, y confirmación por parte del admin.

> Puedes visualizar este diagrama con [Mermaid Live Editor](https://mermaid.live/) o integrarlo en plataformas compatibles.
