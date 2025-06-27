import { verificarAutenticacion } from "./authService.js";

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
      // Manejar clics en los enlaces del sidebar
      const navLinks = document.querySelectorAll(".nav-link");

      navLinks.forEach((link) => {
        const currentHash = location.hash || "#dashboard";
        const href = link.getAttribute("href");
        // slice(15) por el admin-page.html que contiene el href
        if (href.slice(15) === currentHash) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
        link.addEventListener("click", function (e) {
          // Remover clase active de todos los links
          navLinks.forEach((l) => l.classList.remove("active"));
          // Agregar clase active al link clickeado
          this.classList.add("active");

          // Cerrar sidebar en móvil si está abierto
          if (window.innerWidth <= 768) {
            adminSidebar.classList.remove("mobile-open");
            mainContent.classList.remove("sidebar-open");
            document.body.style.overflow = "";
            document
              .querySelector(".admin-sidebar-overlay")
              .classList.toggle("visible");
          }
        });
      });

      // Manejar logout
      document.getElementById("logoutBtn")?.addEventListener("click", () => {
        // Aquí iría la lógica para cerrar sesión
        console.log("Cerrar sesión");
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
