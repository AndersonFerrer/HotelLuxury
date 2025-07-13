# API - Gestión de Tipos de Habitaciones y Características

## Descripción

Esta API permite gestionar los tipos de habitaciones y sus características desde el panel de administración. Todos los endpoints requieren autenticación de empleado.

## Autenticación

Todos los endpoints requieren que el usuario esté autenticado como empleado. Se verifica mediante la sesión PHP.

```php
session_start();
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
    throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
}
```

## Endpoints

### 1. Obtener Tipos de Habitación

**GET** `/api/habitaciones/getTipoHabitaciones.php`

Obtiene todos los tipos de habitación con sus características asignadas y estadísticas.

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "tipos": [
    {
      "id_tipo_habitacion": 1,
      "nombre": "Habitación Estándar",
      "descripcion": "Habitación cómoda con todas las comodidades básicas",
      "precio_noche": "80.00",
      "aforo": 2,
      "habitaciones_count": "5",
      "caracteristicas_count": "5",
      "caracteristicas_asignadas": [1, 2, 3, 4, 5]
    }
  ],
  "message": "Tipos de habitación obtenidos correctamente"
}
```

### 2. Obtener Características

**GET** `/api/habitaciones/getCaracteristicas.php`

Obtiene todas las características con contador de habitaciones que las utilizan.

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "caracteristicas": [
    {
      "id_caracteristica": 1,
      "nombre": "Wi-Fi Gratuito",
      "descripcion": "Conexión a internet de alta velocidad sin costo adicional",
      "habitaciones_count": "15"
    }
  ],
  "message": "Características obtenidas correctamente"
}
```

### 3. Crear Tipo de Habitación

**POST** `/api/habitaciones/insertTipo.php`

Crea un nuevo tipo de habitación con características opcionales.

#### Cuerpo de la Petición
```json
{
  "nombre": "Nuevo Tipo",
  "descripcion": "Descripción del nuevo tipo",
  "precio": 150.00,
  "aforo": 4,
  "caracteristicas": [1, 2, 3]
}
```

#### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Tipo de habitación creado exitosamente",
  "id_tipo_habitacion": 5
}
```

### 4. Actualizar Tipo de Habitación

**POST** `/api/habitaciones/updateTipo.php?id={id}`

Actualiza un tipo de habitación existente.

#### Parámetros de URL
- `id`: ID del tipo de habitación a actualizar

#### Cuerpo de la Petición
```json
{
  "nombre": "Tipo Actualizado",
  "descripcion": "Nueva descripción",
  "precio": 180.00,
  "aforo": 3,
  "caracteristicas": [1, 2, 4, 5]
}
```

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Tipo de habitación actualizado exitosamente"
}
```

### 5. Eliminar Tipo de Habitación

**DELETE** `/api/habitaciones/deleteTipo.php?id={id}`

Elimina un tipo de habitación (solo si no tiene habitaciones asociadas).

#### Parámetros de URL
- `id`: ID del tipo de habitación a eliminar

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Tipo de habitación eliminado exitosamente"
}
```

### 6. Crear Característica

**POST** `/api/habitaciones/insertCaracteristica.php`

Crea una nueva característica.

#### Cuerpo de la Petición
```json
{
  "nombre": "Nueva Característica",
  "descripcion": "Descripción de la característica"
}
```

#### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Característica creada exitosamente",
  "id_caracteristica": 13
}
```

### 7. Actualizar Característica

**POST** `/api/habitaciones/updateCaracteristica.php?id={id}`

Actualiza una característica existente.

#### Parámetros de URL
- `id`: ID de la característica a actualizar

#### Cuerpo de la Petición
```json
{
  "nombre": "Característica Actualizada",
  "descripcion": "Nueva descripción"
}
```

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Característica actualizada exitosamente"
}
```

### 8. Eliminar Característica

**DELETE** `/api/habitaciones/deleteCaracteristica.php?id={id}`

Elimina una característica y todas sus asignaciones.

#### Parámetros de URL
- `id`: ID de la característica a eliminar

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Característica eliminada exitosamente"
}
```

### 9. Obtener Estadísticas

**GET** `/api/habitaciones/stats.php`

Obtiene estadísticas generales para el dashboard.

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "stats": {
    "total_tipos": 4,
    "total_caracteristicas": 12,
    "precio_promedio": 187.50,
    "total_habitaciones": 20
  }
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Nombre y precio son requeridos"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Acceso denegado. Solo empleados pueden acceder a esta funcionalidad."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Tipo de habitación no encontrado"
}
```

### 405 - Method Not Allowed
```json
{
  "success": false,
  "error": "Método no permitido"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": "Ya existe un tipo de habitación con ese nombre"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

## Validaciones

### Tipos de Habitación
- **Nombre**: Requerido, único
- **Precio**: Requerido, mayor a 0
- **Aforo**: Opcional, por defecto 4
- **Características**: Array opcional de IDs de características

### Características
- **Nombre**: Requerido, único
- **Descripción**: Opcional

## Transacciones

Las operaciones que involucran múltiples tablas (crear/actualizar tipos con características) utilizan transacciones de base de datos para garantizar la integridad de los datos.

## Seguridad

- Todos los endpoints verifican autenticación de empleado
- Validación de datos de entrada
- Sanitización de parámetros
- Manejo de errores robusto
- Logs de errores para debugging

## Ejemplos de Uso

### Crear un nuevo tipo de habitación
```javascript
const response = await fetch('/api/habitaciones/insertTipo.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Suite Premium',
    descripcion: 'Suite de lujo con servicios exclusivos',
    precio: 250.00,
    aforo: 4,
    caracteristicas: [1, 2, 3, 4, 5, 6]
  })
});

const result = await response.json();
if (result.success) {
  console.log('Tipo creado:', result.id_tipo_habitacion);
}
```

### Obtener estadísticas
```javascript
const response = await fetch('/api/habitaciones/stats.php');
const result = await response.json();
if (result.success) {
  console.log('Estadísticas:', result.stats);
}
``` 