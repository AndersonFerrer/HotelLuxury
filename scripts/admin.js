import { cerrarSesion, getSession } from "./authService.js";

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

// Función principal de inicialización del admin
async function initializeAdmin() {
  try {
    // Mostrar pantalla de carga
    showLoadingScreen();

    // Usar getSession para evitar múltiples fetch
    await getSession();

    // Toggle sidebar en móvil
    const menuToggle = document.getElementById("menuToggle");
    const aside = document.getElementById("aside-root");
    const mainContent = document.querySelector(".admin-main-content");
    let adminSidebar;

    // Cargar sidebar
    try {
      const response = await fetch("./components/aside-admin.html");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      aside.innerHTML = data;
      adminSidebar = document.querySelector(".admin-sidebar");

      // Función para actualizar el estado activo
      const updateActiveLink = () => {
        const navLinks = document.querySelectorAll(".nav-link");
        const currentHash = window.location.hash || "#dashboard";

        navLinks.forEach((link) => {
          // Extraer el hash del href (ej: "admin-page.html#reservas" → "#reservas")
          const linkHash =
            "#" + (link.getAttribute("href").split("#")[1] || "dashboard");
          link.classList.toggle("active", linkHash === currentHash);
        });
      };

      // Manejar clics en los enlaces del sidebar
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
          // Prevenir comportamiento por defecto solo si es un enlace hash
          if (this.getAttribute("href").includes("#")) {
            e.preventDefault();

            // Actualizar el hash sin recargar
            const newHash = this.getAttribute("href").split("#")[1];
            window.location.hash = newHash || "dashboard";
          }

          // Cerrar sidebar en móvil si está abierto
          if (window.innerWidth <= 768) {
            adminSidebar.classList.remove("mobile-open");
            mainContent.classList.remove("sidebar-open");
            document.body.style.overflow = "";
            document
              .querySelector(".admin-sidebar-overlay")
              ?.classList.remove("visible");
          }
        });
      });

      // Actualizar al cargar y cuando cambia el hash
      updateActiveLink();
      window.addEventListener("hashchange", updateActiveLink);

      // Manejar logout
      document.getElementById("logoutBtn")?.addEventListener("click", () => {
        cerrarSesion();
      });
    } catch (error) {
      console.error("Error al cargar el sidebar:", error);
    }

    // Toggle sidebar en móvil
    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        if (adminSidebar) {
          adminSidebar.classList.toggle("mobile-open");
          document
            .querySelector(".admin-sidebar-overlay")
            .classList.toggle("visible");
          document.body.style.overflow = adminSidebar.classList.contains(
            "mobile-open"
          )
            ? "hidden"
            : "";
        }
      });
    }

    // Add click handler for overlay to close sidebar
    const overlay = document.querySelector(".admin-sidebar-overlay");
    if (overlay) {
      overlay.addEventListener("click", function () {
        if (adminSidebar) {
          adminSidebar.classList.remove("mobile-open");
          this.classList.remove("visible");
          document.body.style.overflow = "";
        }
      });
    }

    // Pequeña pausa para asegurar que todo esté renderizado
    await new Promise((resolve) => setTimeout(resolve, 100));

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
