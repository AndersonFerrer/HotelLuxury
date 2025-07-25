import { cerrarSesion, getSession } from "./authService.js";
import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";
import { SidebarManager } from "./components/SidebarManager.js";

// Función para mostrar la pantalla de carga
function showLoadingScreen() {
  // Cargar estilos de carga si no están ya cargados
  if (!document.querySelector('link[href*="loading.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/loading.css";
    document.head.appendChild(link);
  }

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
    showLoadingScreen();

    // Usar getSession para evitar múltiples fetch
    await getSession();

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
                  showErrorToast("Error al cerrar sesión");
                }

                return result;
              },
              "Cerrando sesión..."
            );
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
            showErrorToast("Error al cerrar sesión");
          }
        });
    } catch (error) {
      console.error("Error al cargar el sidebar:", error);
      showErrorToast(`Error al cargar el menú lateral: ${error.message}`);
    }

    // Pequeña pausa para asegurar que todo esté renderizado
    await sleep(100);

    // Ocultar pantalla de carga
    hideLoadingScreen();
  } catch (error) {
    console.error("Error durante la inicialización del admin:", error);
    // En caso de error, ocultar la pantalla de carga de todas formas
    hideLoadingScreen();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initializeAdmin);
