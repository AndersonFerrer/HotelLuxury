# Gestión de Huéspedes - Luxury Hotel

## Descripción
Página de administración para gestionar todos los huéspedes del hotel. Permite ver, crear, editar y eliminar huéspedes, así como filtrar y buscar información específica.

## Archivos Creados/Modificados

### 1. `pagesAdmin/huespedes.html`
- **Contenido**: Solo el contenido que se carga dinámicamente en el contenedor
- **Estructura**: Stats cards, filtros, tabla y modal usando `<dialog>` nativo
- **Integración**: Funciona con el sistema de carga dinámica del router

### 2. `styles/huespedesAdmin.css`
- **Estilos**: Adaptados al sistema existente de admin
- **Modal**: Usa el patrón de modales de habitaciones con `<dialog>`
- **Responsive**: Diseño adaptativo para móviles y desktop

### 3. `scripts/huespedesAdmin.js`
- **Patrón**: Sigue el mismo patrón que `habitacionesAdmin.js`
- **Modales**: Usa el elemento `<dialog>` nativo con `showModal()` y `close()`
- **Eventos**: Configuración dinámica de eventos después de renderizar la tabla
- **Datos**: Datos estáticos listos para conectar con el backend

## Funcionalidades Implementadas

### 📊 Estadísticas
- Total de huéspedes
- Huéspedes en hotel
- Reservas activas
- Total de reservas

### 🔍 Filtros
- Búsqueda por nombre, documento o email
- Filtro por estado (En Hotel, Check-out, Reserva Activa, Pendiente)
- Filtro por tipo de documento (DNI, Pasaporte, Carnet de Extranjería)

### 📋 Tabla de Huéspedes
- Información completa del huésped
- Avatar con iniciales
- Estado con badges coloridos
- Historial de reservas
- Acciones: Ver, Editar, Eliminar

### 🎯 Modales
- **Ver Detalles**: Información completa del huésped
- **Editar**: Formulario para modificar datos
- **Nuevo Huésped**: Formulario de registro
- **Eliminar**: Confirmación de eliminación

## Integración con el Sistema

### Router
La página se carga a través del router en la ruta `#clientes`:
```javascript
clientes: {
  html: "pagesAdmin/huespedes.html",
  css: "styles/huespedesAdmin.css",
  script: "scripts/huespedesAdmin.js",
}
```

### Sistema de Modales
Usa el mismo patrón que habitaciones:
```javascript
const modal = document.getElementById("modal-huesped");
modal.showModal(); // Abrir
modal.close(); // Cerrar
```

### Loader Utils
Integrado con el sistema de loading:
```javascript
import { setTableLoading, setTableNormal, withButtonLoader, showSuccessToast, showErrorToast } from "./loaderUtils.js";
```

## Conexión con Backend

### Endpoints Necesarios

#### 1. Estadísticas
```php
// api/huespedes/stats.php
{
  "success": true,
  "stats": {
    "total": 5,
    "en_hotel": 1,
    "reservas_activas": 1,
    "total_reservas": 18
  }
}
```

#### 2. Listar Huéspedes
```php
// api/huespedes/getAll.php
{
  "success": true,
  "data": [
    {
      "id_huesped": 1,
      "nombres": "Juan Carlos",
      "apellidos": "Pérez González",
      "id_tipo_documento": 1,
      "numero_documento": "12345678",
      "estado_actual": "checkout",
      "reserva": { /* datos de reserva */ },
      "cliente": { /* datos del cliente */ },
      "historial_reservas": 3,
      "ultima_estancia": "2024-02-05"
    }
  ]
}
```

#### 3. Crear Huésped
```php
// api/huespedes/insert.php
POST {
  "nombres": "Juan",
  "apellidos": "Pérez",
  "id_tipo_documento": 1,
  "numero_documento": "12345678",
  "id_reserva": 1
}
```

#### 4. Actualizar Huésped
```php
// api/huespedes/update.php
POST {
  "id_huesped": 1,
  "nombres": "Juan Carlos",
  "apellidos": "Pérez González",
  "id_tipo_documento": 1,
  "numero_documento": "12345678",
  "estado_actual": "checkin"
}
```

#### 5. Eliminar Huésped
```php
// api/huespedes/delete.php
DELETE ?id_huesped=1
```

## Estructura de Datos

### Huésped
```javascript
{
  id_huesped: 1,
  nombres: "Juan Carlos",
  apellidos: "Pérez González",
  id_tipo_documento: 1,
  numero_documento: "12345678",
  estado_actual: "checkout", // checkin, checkout, reserva_activa, reserva_pendiente
  reserva: {
    id_reserva: 1,
    fecha_checkin: "2024-02-01",
    fecha_checkout: "2024-02-05",
    estado: "completada",
    habitacion: {
      numero: "101",
      tipo: "Habitación Estándar"
    },
    total: 480.0
  },
  cliente: {
    persona: {
      telefono: "+51 987654321",
      correo: "juan.perez@email.com",
      fecha_nacimiento: "1985-03-15",
      direccion: {
        region: "Lima",
        provincia: "Lima",
        distrito: "Miraflores",
        direccion_detallada: "Av. Larco 123"
      }
    }
  },
  historial_reservas: 3,
  ultima_estancia: "2024-02-05"
}
```

## Estados de Huésped

- **checkin**: Huésped actualmente en el hotel
- **checkout**: Huésped que ya se fue
- **reserva_activa**: Tiene una reserva confirmada
- **reserva_pendiente**: Tiene una reserva pendiente

## Uso

1. **Acceder**: Navegar a `#clientes` en el panel de administración
2. **Filtrar**: Usar los filtros de búsqueda y estado
3. **Ver detalles**: Hacer clic en el botón "Ver" (ojo)
4. **Editar**: Hacer clic en el botón "Editar" (lápiz)
5. **Eliminar**: Hacer clic en el botón "Eliminar" (basura)
6. **Nuevo huésped**: Hacer clic en "Registrar Huésped"

## Notas Técnicas

- **Modales**: Usa `<dialog>` nativo para mejor accesibilidad
- **Eventos**: Se configuran dinámicamente después de renderizar la tabla
- **Loading**: Integrado con el sistema de loading existente
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Datos**: Listo para conectar con el backend PHP 