# Sistema de Carga - Luxury Hotel

## Descripción

Este sistema implementa una pantalla de carga completa que se muestra mientras se cargan los componentes principales (navbar y footer) de la aplicación. Esto elimina el problema del "flash" de contenido sin estos elementos.

## Características

- **Pantalla de carga completa**: Cubre toda la pantalla con un diseño atractivo
- **Carga paralela**: Los componentes se cargan simultáneamente para mayor eficiencia
- **Transiciones suaves**: Animaciones de entrada y salida fluidas
- **Manejo de errores**: Funciona incluso si algún componente falla al cargar
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Archivos Principales

### `load-component.js`
- **Función principal**: `initializePage()`
- **Carga de componentes**: `loadComponent()`
- **Carga de scripts**: `loadScriptModule()`
- **Pantalla de carga**: `showLoadingScreen()` y `hideLoadingScreen()`

### `styles/loading.css`
- Estilos para la pantalla de carga
- Animaciones CSS
- Clases para controlar visibilidad del contenido

## Flujo de Carga

1. **Inicio**: Se muestra la pantalla de carga inmediatamente
2. **Verificación de sesión**: Se carga la información de autenticación
3. **Carga de componentes**: Navbar y footer se cargan en paralelo
4. **Carga de scripts**: Se carga el script del navbar
5. **Finalización**: Se oculta la pantalla de carga y se muestra el contenido

## Implementación en Páginas

### Clases CSS Utilizadas

```css
.content-loading {
  visibility: hidden;
}

.content-loaded {
  visibility: visible;
}
```

### Estructura HTML Requerida

#### Para páginas normales:
```html
<!-- En el head -->
<link rel="stylesheet" href="./styles/loading.css" />

<!-- En el body -->
<div id="navbar-root"></div>
<main class="content-loading">
  <!-- Contenido de la página -->
</main>
<div id="footer-root"></div>
<script type="module" src="./load-component.js"></script>
```

#### Para admin-page.html:
```html
<!-- En el head -->
<link rel="stylesheet" href="/styles/loading.css" />

<!-- En el body -->
<div id="aside-root"></div>
<div class="admin-main-content content-loading">
  <!-- Contenido del admin -->
</div>
<script type="module" src="/scripts/admin.js"></script>
```

## Páginas Actualizadas

- ✅ `index.html` - Página principal
- ✅ `auth.html` - Autenticación
- ✅ `mi-cuenta.html` - Perfil de usuario
- ✅ `contact.html` - Contacto
- ✅ `room-detail.html` - Detalles de habitación
- ✅ `admin-page.html` - Panel de administración (sistema integrado)

## Implementación Especial para Admin

El panel de administración tiene una implementación especial porque:

1. **No usa `load-component.js`**: El sistema de carga está integrado directamente en `admin.js`
2. **Carga sidebar dinámicamente**: El sidebar se carga desde `components/aside-admin.html`
3. **Router interno**: Usa `router.js` para cargar páginas internas del admin
4. **Indicadores de carga**: Muestra indicadores de carga tanto al inicializar como al cambiar entre páginas

### Archivos Modificados para Admin:

- `scripts/admin.js` - Sistema de carga integrado
- `scripts/router.js` - Indicadores de carga para navegación interna
- `admin-page.html` - Estructura actualizada

## Personalización

### Cambiar Colores de la Pantalla de Carga

Edita `styles/loading.css`:

```css
#loading-screen {
  background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
}

.loading-logo .logo-text {
  color: #tu-color-dorado;
}

.loading-spinner {
  border-top-color: #tu-color-dorado;
}
```

### Cambiar Texto de Carga

Edita `load-component.js` en la función `showLoadingScreen()`:

```javascript
<p class="loading-text">Tu texto personalizado...</p>
```

### Cambiar Logo

Edita `load-component.js` en la función `showLoadingScreen()`:

```javascript
<div class="loading-logo">
  <span class="logo-text">Tu Logo</span>
</div>
```

## Ventajas

1. **Mejor UX**: No hay flash de contenido sin navbar/footer
2. **Profesional**: Pantalla de carga atractiva y consistente
3. **Rápido**: Carga paralela de componentes
4. **Robusto**: Manejo de errores incluido
5. **Flexible**: Fácil de personalizar

## Notas Técnicas

- Los estilos se cargan dinámicamente para evitar dependencias
- Se usa `visibility: hidden` en lugar de `display: none` para mantener el layout
- La transición de salida es de 500ms para una experiencia suave
- El sistema funciona incluso si algún componente falla al cargar 