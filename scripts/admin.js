import { cerrarSesion, verificarAutenticacion } from "./authService.js";

document.addEventListener("DOMContentLoaded", async function () {
  await verificarAutenticacion();

  // Toggle sidebar en móvil
  const menuToggle = document.getElementById("menuToggle");
  const aside = document.getElementById("aside-root");
  const mainContent = document.querySelector(".admin-main-content");
  let adminSidebar;
  // Cargar sidebar
  fetch("./components/aside-admin.html")
    .then((response) => response.text())
    .then((data) => {
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
        // Aquí iría la lógica para cerrar sesión
        cerrarSesion();
      });
    })
    .catch((error) => {
      console.error("Error al cargar el sidebar:", error);
    });

  // Toggle sidebar en móvil
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      adminSidebar.classList.toggle("mobile-open");
      // adminSidebar.classList.add("mobile-open");
      document
        .querySelector(".admin-sidebar-overlay")
        .classList.toggle("visible");
      document.body.style.overflow = aside.classList.contains("mobile-open")
        ? "hidden"
        : "";
    });
  }

  // Add click handler for overlay to close sidebar
  const overlay = document.querySelector(".admin-sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", function () {
      adminSidebar.classList.remove("mobile-open");
      this.classList.remove("visible");
      document.body.style.overflow = "";
    });
  }
});
