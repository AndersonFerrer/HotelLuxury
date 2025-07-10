import { getSession } from "./scripts/authService.js";

// Función para mostrar la pantalla de carga
function showLoadingScreen() {
  // Cargar estilos de carga si no están ya cargados
  if (!document.querySelector('link[href*="loading.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./styles/loading.css";
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
      <p class="loading-text">Cargando...</p>
    </div>
  `;

  document.body.appendChild(loadingScreen);

  // Ocultar el contenido principal
  const mainContent = document.querySelector(
    "main, .mi-cuenta-container, .admin-main-content, .room-detail-container, .contact-page"
  );
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
  const mainContent = document.querySelector(
    "main, .mi-cuenta-container, .admin-main-content, .room-detail-container, .contact-page"
  );
  if (mainContent) {
    mainContent.classList.remove("content-loading");
    mainContent.classList.add("content-loaded");
  }
}

// Función para cargar un componente
async function loadComponent(componentPath, targetId) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    document.getElementById(targetId).innerHTML = data;
    return true;
  } catch (error) {
    console.error(`Error al cargar ${componentPath}:`, error);
    return false;
  }
}

// Función para cargar un script como módulo
function loadScriptModule(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Función principal de inicialización
async function initializePage() {
  try {
    // Mostrar pantalla de carga
    showLoadingScreen();

    // Cargar sesión
    await getSession();

    // Cargar componentes en paralelo
    const componentPromises = [
      loadComponent("./components/navbar.html", "navbar-root"),
      loadComponent("./components/footer.html", "footer-root"),
    ];

    // Esperar a que se carguen los componentes
    const [navbarLoaded, footerLoaded] = await Promise.all(componentPromises);

    // Cargar script del navbar si se cargó correctamente
    if (navbarLoaded) {
      try {
        await loadScriptModule("./scripts/navbar.js");
        // Recargar el navbar para mostrar las opciones correctas según autenticación
        if (window.recargarNavbar) {
          window.recargarNavbar();
        }
      } catch (error) {
        console.error("Error al cargar script del navbar:", error);
      }
    }

    // Pequeña pausa para asegurar que todo esté renderizado
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Ocultar pantalla de carga
    hideLoadingScreen();
  } catch (error) {
    console.error("Error durante la inicialización:", error);
    // En caso de error, ocultar la pantalla de carga de todas formas
    hideLoadingScreen();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initializePage);
