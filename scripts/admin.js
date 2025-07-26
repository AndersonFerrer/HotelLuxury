import { cerrarSesion, getSession } from "./authService.js";
import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";
import { SidebarManager } from "./components/SidebarManager.js";

// Función para cargar estilos de forma optimizada
function loadStylesheet(href, id) {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (document.querySelector(`link[href*="${href}"]`)) {
      resolve(true);
      return;
    }
    
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    if (id) link.id = id;
    
    // Manejar eventos de carga
    link.onload = () => resolve(true);
    link.onerror = () => reject(new Error(`Error al cargar el estilo: ${href}`));
    
    document.head.appendChild(link);
  });
}

// Función para mostrar la pantalla de carga
async function showLoadingScreen() {
  try {
    // Cargar estilos de carga de forma asíncrona
    await loadStylesheet("/styles/loading.css", "loading-styles");
    
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loading-screen";
    loadingScreen.innerHTML = `
      <div class="loading-screen-content">
        <div class="loading-logo">
          <span class="logo-text">Luxury Hotel</span>
        </div>
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando Panel de Administración...</p>
      </div>
    `;

    document.body.appendChild(loadingScreen);

    // Ocultar el contenido principal
    const mainContent = document.querySelector(".admin-main-content");
    if (mainContent) {
      mainContent.classList.add("content-loading");
    }
  } catch (error) {
    console.error("Error al mostrar pantalla de carga:", error);
    // Fallback silencioso - continuar sin pantalla de carga
  }
}

// Función para ocultar la pantalla de carga
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      if (loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 500);
  }

  // Mostrar el contenido principal
  const mainContent = document.querySelector(".admin-main-content");
  if (mainContent) {
    mainContent.classList.remove("content-loading");
    mainContent.classList.add("content-loaded");
  }
}

// Función de utilidad para esperar un tiempo determinado
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal de inicialización del admin
async function initializeAdmin() {
  try {
    // Mostrar pantalla de carga
    await showLoadingScreen();

    // Cargar estilos adicionales de forma asíncrona
    const stylesPromises = [
      loadStylesheet("/styles/admin.css"),
      loadStylesheet("/styles/tablesAdmin.css")
    ];
    
    // Verificar sesión
    try {
      await getSession();
    } catch (error) {
      handleError(error, "session", initializeAdmin);
      hideLoadingScreen();
      return;
    }

    // Esperar que se carguen los estilos
    await Promise.allSettled(stylesPromises);

    const aside = document.getElementById("aside-root");
    const sidebarManager = new SidebarManager();
    
    // Cargar sidebar
    try {
      const response = await fetch("./components/aside-admin.html");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      aside.innerHTML = data;
      
      // Inicializar el gestor del sidebar
      sidebarManager.initialize(document.querySelector(".admin-sidebar"));
      
      // Manejar logout
      document
        .getElementById("logoutBtn")
        ?.addEventListener("click", async (e) => {
          e.preventDefault();

          try {
            await withButtonLoader(
              e.target,
              async () => {
                const result = await cerrarSesion();

                if (result.success) {
                  showSuccessToast("Sesión cerrada exitosamente");
                  // La función cerrarSesion ya maneja la redirección automáticamente
                } else {
                  throw new Error(result.message || "Error al cerrar sesión");
                }

                return result;
              },
              "Cerrando sesión..."
            );
          } catch (error) {
            handleError(error, "logout");
          }
        });
    } catch (error) {
      handleError(error, "sidebar", initializeAdmin);
    }

    // Pequeña pausa para asegurar que todo esté renderizado
    await sleep(100);

    // Ocultar pantalla de carga
    hideLoadingScreen();
  } catch (error) {
    handleError(error, "init");
    // En caso de error, ocultar la pantalla de carga de todas formas
    hideLoadingScreen();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initializeAdmin);

// Constantes para mensajes de error
const ERROR_MESSAGES = {
  SESSION: "Error al verificar la sesión",
  SIDEBAR_LOAD: "Error al cargar el menú lateral",
  LOGOUT: "Error al cerrar sesión",
  INIT: "Error durante la inicialización del panel",
  NETWORK: "Error de conexión. Verifica tu internet",
  UNKNOWN: "Ha ocurrido un error inesperado"
};

// Función para manejar errores de forma centralizada
function handleError(error, context, retry = null) {
  console.error(`Error en ${context}:`, error);
  
  // Determinar tipo de error para mensaje personalizado
  let errorMessage = ERROR_MESSAGES.UNKNOWN;
  
  if (error.name === "NetworkError" || error.message.includes("network") || 
      error.message.includes("fetch") || error.message.includes("HTTP")) {
    errorMessage = ERROR_MESSAGES.NETWORK;
  } else if (context === "session") {
    errorMessage = ERROR_MESSAGES.SESSION;
  } else if (context === "sidebar") {
    errorMessage = ERROR_MESSAGES.SIDEBAR_LOAD;
  } else if (context === "logout") {
    errorMessage = ERROR_MESSAGES.LOGOUT;
  } else if (context === "init") {
    errorMessage = ERROR_MESSAGES.INIT;
  }
  
  // Mostrar toast con opción de reintento
  if (retry) {
    showErrorToastWithRetry(errorMessage, retry);
  } else {
    showErrorToast(errorMessage);
  }
  
  // Registrar error para análisis (podría enviarse a un servicio)
  logError(error, context);
}

// Función para mostrar toast de error con botón de reintento
function showErrorToastWithRetry(message, retryFunction) {
  // Crear contenedor de toasts si no existe
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Crear toast con botón de reintento
  const toast = document.createElement("div");
  toast.style.cssText = `
    background: #ef4444;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  
  const retryButton = document.createElement("button");
  retryButton.textContent = "Reintentar";
  retryButton.style.cssText = `
    background: white;
    color: #ef4444;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
  `;
  
  retryButton.addEventListener("click", () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    retryFunction();
  });
  
  toast.appendChild(messageDiv);
  toast.appendChild(retryButton);

  // Agregar toast al contenedor
  toastContainer.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // No remover automáticamente para dar tiempo al usuario de usar el botón
}

// Función para registrar errores (podría enviar a un servicio de monitoreo)
function logError(error, context) {
  // Aquí podrías implementar lógica para enviar errores a un servicio
  // Por ahora solo registramos en consola con más detalles
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  console.error("Error registrado:", errorDetails);
  // localStorage.setItem('lastError', JSON.stringify(errorDetails));
}

/**
 * Función para reintentar una operación con backoff exponencial
 * @param {Function} operation - Función a reintentar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} baseDelay - Retraso base en ms
 * @returns {Promise} - Resultado de la operación
 */
async function retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Intento ${attempt + 1}/${maxRetries} fallido:`, error);
      lastError = error;
      
      // Calcular retraso con backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError;
}
