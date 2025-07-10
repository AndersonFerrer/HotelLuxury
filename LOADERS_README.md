# Sistema de Loaders y Estados de Carga

Este sistema proporciona una experiencia de usuario mejorada mostrando estados de carga en lugar de pantallas en blanco o alertas básicas.

## Características

- **Loaders en botones**: Muestran estado de carga directamente en los botones
- **Modal de carga global**: Para operaciones que requieren toda la atención del usuario
- **Loaders de sección**: Para cargar contenido específico de una página
- **Loaders de tabla**: Para operaciones CRUD en tablas
- **Toasts de notificación**: Mensajes de éxito y error elegantes
- **Validaciones mejoradas**: Con feedback visual inmediato
- **Manejo correcto de datos**: Nombres y apellidos separados según la estructura de la BD

## Correcciones Recientes

### Manejo de Nombres y Apellidos
- **Problema**: Los campos de nombres y apellidos se combinaban en un solo campo
- **Solución**: Separación completa en frontend y backend
- **Cambios realizados**:
  - Frontend: Campos separados en formulario de edición
  - Backend: Validación y actualización de nombres y apellidos por separado
  - Datos de sesión: Estructura correcta con nombres y apellidos independientes

## Uso Básico

### Importar utilidades

```javascript
import { 
  withButtonLoader, 
  withLoadingModal, 
  showSuccessToast, 
  showErrorToast,
  setTableLoading,
  setTableNormal 
} from "./loaderUtils.js";
```

### Loader en botón

```javascript
const submitBtn = document.querySelector('#submit-btn');

await withButtonLoader(
  submitBtn,
  async () => {
    // Tu función async aquí
    const result = await miFuncionAsync();
    return result;
  },
  "Procesando..." // Texto opcional durante la carga
);
```

### Modal de carga

```javascript
await withLoadingModal(
  async () => {
    // Operación que requiere atención completa
    await operacionImportante();
  },
  "Guardando cambios..." // Mensaje personalizado
);
```

### Loader en tabla

```javascript
const table = document.querySelector('.mi-tabla');

try {
  setTableLoading(table);
  // Cargar datos
  const data = await fetchData();
  updateTable(data);
} finally {
  setTableNormal(table);
}
```

### Toasts de notificación

```javascript
// Éxito
showSuccessToast("Operación completada exitosamente");

// Error
showErrorToast("Error al procesar la solicitud");

// Con duración personalizada
showSuccessToast("Mensaje", 5000); // 5 segundos
```

## Ejemplos de Implementación

### Formulario de Login

```javascript
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('button[type="submit"]');
  
  try {
    await withButtonLoader(
      submitBtn,
      async () => {
        const result = await iniciarSesion(credentials);
        
        if (result.success) {
          showSuccessToast("Inicio de sesión exitoso");
          // Redirección
        } else {
          showErrorToast(result.error);
        }
        
        return result;
      },
      "Iniciando sesión..."
    );
  } catch (error) {
    showErrorToast("Error de conexión");
  }
});
```

### Carga de Datos

```javascript
async function cargarDatos() {
  const container = document.getElementById('data-container');
  
  try {
    setSectionLoading(container);
    
    const response = await fetch('/api/datos');
    const data = await response.json();
    
    if (data.success) {
      mostrarDatos(data.data);
    } else {
      showErrorToast("Error al cargar datos");
    }
  } catch (error) {
    showErrorToast("Error de conexión");
  } finally {
    setSectionNormal(container);
  }
}
```

### Operación CRUD

```javascript
async function eliminarItem(id) {
  const deleteBtn = document.querySelector(`[data-id="${id}"]`);
  
  try {
    await withButtonLoader(
      deleteBtn,
      async () => {
        const response = await fetch(`/api/items/${id}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          showSuccessToast("Elemento eliminado");
          recargarLista();
        } else {
          throw new Error(result.error);
        }
        
        return result;
      },
      "Eliminando..."
    );
  } catch (error) {
    showErrorToast("Error al eliminar: " + error.message);
  }
}
```

### Actualización de Perfil (con nombres y apellidos separados)

```javascript
async function actualizarPerfil() {
  const saveBtn = document.getElementById('save-profile-btn');
  
  try {
    await withButtonLoader(
      saveBtn,
      async () => {
        const datosPerfil = {
          nombres: document.getElementById("input-nombres").value,
          apellidos: document.getElementById("input-apellidos").value,
          correo: document.getElementById("input-email").value,
          telefono: document.getElementById("input-phone").value,
          direccion: {
            direccion_detallada: document.getElementById("input-address").value,
            distrito: document.getElementById("input-city").value,
            provincia: document.getElementById("input-province").value,
            region: document.getElementById("input-region").value,
          },
        };

        const response = await fetch("/api/auth/updateProfile.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosPerfil),
        });

        const result = await response.json();
        
        if (result.success) {
          showSuccessToast("Perfil actualizado exitosamente");
          // Actualizar datos locales y recargar
        } else {
          showErrorToast("Error al actualizar perfil: " + result.error);
        }
        
        return result;
      },
      "Guardando..."
    );
  } catch (error) {
    showErrorToast("Error al guardar perfil");
  }
}
```

## Estilos CSS

Los estilos están incluidos en `styles/styles.css` y incluyen:

- Animaciones de spinner
- Estados de botones deshabilitados
- Modal de carga con overlay
- Toasts con animaciones
- Loaders para diferentes tipos de contenido

## Mejores Prácticas

1. **Siempre usar try/catch**: Manejar errores apropiadamente
2. **Feedback inmediato**: Mostrar loaders tan pronto como se inicie una operación
3. **Mensajes claros**: Usar textos descriptivos en los loaders
4. **Consistencia**: Usar el mismo patrón en toda la aplicación
5. **Accesibilidad**: Los loaders no interfieren con lectores de pantalla
6. **Validación de datos**: Verificar que los campos requeridos estén completos
7. **Estructura de datos**: Mantener consistencia entre frontend y backend

## Compatibilidad

- Funciona con todos los navegadores modernos
- Compatible con ES6 modules
- No requiere dependencias externas
- Integrado con el sistema de diseño existente 