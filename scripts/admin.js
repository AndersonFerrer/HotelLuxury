import { verificarAutenticacion } from "./authService.js";

document.addEventListener("DOMContentLoaded", async function () {
  await verificarAutenticacion();
  // Toggle sidebar en móvil
  const menuToggle = document.getElementById("menuToggle");
  const aside = document.getElementById("aside-root");
  // Cargar sidebar
  fetch("./components/aside-admin.html")
    .then((response) => response.text())
    .then((data) => {
      aside.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error al cargar el sidebar:", error);
    });

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      document.querySelector(".admin-sidebar").classList.toggle("mobile-open");
      document
        .querySelector(".admin-main-content")
        .classList.toggle("sidebar-open");
    });
  }

  // Cargar contenido dinámico basado en URL
  function loadContent() {
    const path = window.location.pathname;
    const contentContainer = document.getElementById("admin-content-container");
    const pageTitle = document.getElementById("pageTitle");

    // Aquí iría la lógica para cargar diferentes vistas
    // Ejemplo básico:
    if (path.includes("bookings")) {
      pageTitle.textContent = "Reservas";
      contentContainer.innerHTML = "<h2>Gestión de Reservas</h2>";
    } else if (path.includes("rooms")) {
      pageTitle.textContent = "Habitaciones";
      contentContainer.innerHTML = "<h2>Gestión de Habitaciones</h2>";
    }
  }

  loadContent();
});
