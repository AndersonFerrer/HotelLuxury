# Instalación - Gestión de Tipos de Habitaciones y Características

## Requisitos Previos

- PHP 8.0 o superior
- PostgreSQL 12 o superior
- Sistema de autenticación funcionando
- Panel de administración configurado

## Pasos de Instalación

### 1. Verificar Estructura de Base de Datos

Primero, asegúrate de que tu base de datos tenga la estructura correcta. Ejecuta el script de corrección:

```bash
psql -U tu_usuario -d luxury_hotel -f corregir_tabla_tipos_caracteristicas.sql
```

Este script:
- Corrige la tabla `TipoHabitacionCaracteristica`
- Inserta datos de ejemplo
- Verifica que todo esté funcionando

### 2. Verificar Archivos Creados

Asegúrate de que se hayan creado todos estos archivos:

#### Backend (PHP)
- ✅ `api/habitaciones/TiposCaracteristicasService.php`
- ✅ `api/habitaciones/getTipoHabitaciones.php`
- ✅ `api/habitaciones/getCaracteristicas.php`
- ✅ `api/habitaciones/insertTipo.php`
- ✅ `api/habitaciones/updateTipo.php`
- ✅ `api/habitaciones/deleteTipo.php`
- ✅ `api/habitaciones/insertCaracteristica.php`
- ✅ `api/habitaciones/updateCaracteristica.php`
- ✅ `api/habitaciones/deleteCaracteristica.php`
- ✅ `api/habitaciones/stats.php` (actualizado)

#### Frontend (Ya existían)
- ✅ `pagesAdmin/tipos-caracteristicas.html`
- ✅ `styles/tiposCaracteristicasAdmin.css`
- ✅ `scripts/tiposCaracteristicasAdmin.js` (actualizado)

#### Configuración
- ✅ `scripts/router.js` (ya configurado)
- ✅ `components/aside-admin.html` (ya configurado)

### 3. Verificar Permisos

Asegúrate de que el servidor web tenga permisos de lectura en todos los archivos:

```bash
chmod 644 api/habitaciones/*.php
chmod 644 api/habitaciones/TiposCaracteristicasService.php
```

### 4. Probar la Instalación

#### Paso 1: Acceder al Panel de Administración
1. Inicia sesión como empleado
2. Ve a `/admin-page.html`
3. Haz clic en "Tipos y Características" en el sidebar

#### Paso 2: Verificar Carga de Datos
1. Deberías ver el dashboard con estadísticas
2. Los tabs "Tipos de Habitación" y "Características" deben funcionar
3. Las tablas deben mostrar datos (si existen) o mensajes de estado vacío

#### Paso 3: Probar Funcionalidades
1. **Crear Tipo**: Haz clic en "Nuevo Tipo" y completa el formulario
2. **Crear Característica**: Haz clic en "Nueva Característica" y completa el formulario
3. **Editar**: Haz clic en el botón de editar en cualquier fila
4. **Eliminar**: Haz clic en el botón de eliminar (con confirmación)

### 5. Verificar en la Consola del Navegador

Abre las herramientas de desarrollador (F12) y verifica:

1. **Sin errores JavaScript**: No debe haber errores en la consola
2. **Carga de módulos**: Debe aparecer "tiposCaracteristicasAdmin.js cargado"
3. **Peticiones HTTP**: Las peticiones a la API deben devolver 200 OK

### 6. Verificar Logs del Servidor

Revisa los logs de PHP para asegurarte de que no hay errores:

```bash
tail -f /var/log/apache2/error.log
# o
tail -f /var/log/nginx/error.log
```

## Solución de Problemas

### Error: "Tabla TipoHabitacionCaracteristica no existe"

**Solución**: Ejecuta el script de corrección:
```bash
psql -U tu_usuario -d luxury_hotel -f corregir_tabla_tipos_caracteristicas.sql
```

### Error: "Acceso denegado. Solo empleados pueden acceder"

**Solución**: 
1. Verifica que estés logueado como empleado
2. Verifica que la sesión esté activa
3. Revisa la configuración de sesiones PHP

### Error: "Método no permitido"

**Solución**: 
1. Verifica que estés usando el método HTTP correcto (GET, POST, DELETE)
2. Verifica que el servidor web permita estos métodos

### Error: "JSON inválido"

**Solución**: 
1. Verifica que estés enviando JSON válido en las peticiones POST
2. Verifica que el Content-Type sea `application/json`

### Error: "No se puede eliminar el tipo de habitación porque tiene habitaciones asociadas"

**Solución**: 
1. Primero elimina o reasigna las habitaciones asociadas
2. Luego elimina el tipo de habitación

### Error: "Ya existe un tipo de habitación con ese nombre"

**Solución**: 
1. Usa un nombre único para el tipo de habitación
2. O edita el tipo existente en lugar de crear uno nuevo

## Datos de Prueba

El script de corrección inserta automáticamente:

### Tipos de Habitación
- Habitación Estándar ($80/noche)
- Habitación Superior ($120/noche)
- Suite Ejecutiva ($200/noche)
- Suite Presidencial ($350/noche)

### Características
- Wi-Fi Gratuito
- TV por Cable
- Aire Acondicionado
- Minibar
- Caja Fuerte
- Vista al Mar
- Balcón Privado
- Jacuzzi
- Servicio de Habitación
- Gimnasio Acceso
- Piscina Acceso
- Estacionamiento

## Verificación Final

Para verificar que todo funciona correctamente:

1. **Dashboard**: Debe mostrar estadísticas reales
2. **Tabs**: Deben cambiar correctamente entre tipos y características
3. **Búsqueda**: Debe filtrar los resultados
4. **Modales**: Deben abrirse y cerrarse correctamente
5. **Formularios**: Deben validar y enviar datos
6. **Loaders**: Deben mostrarse durante las operaciones
7. **Toasts**: Deben mostrar mensajes de éxito/error

## Soporte

Si encuentras problemas:

1. Revisa la consola del navegador para errores JavaScript
2. Revisa los logs del servidor para errores PHP
3. Verifica la conectividad a la base de datos
4. Verifica que todos los archivos estén en las ubicaciones correctas
5. Verifica que los permisos de archivos sean correctos 