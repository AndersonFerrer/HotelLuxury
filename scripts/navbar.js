import { getSession, clearSessionCache, cerrarSesion } from "./authService.js";
import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

// Seleccionar los elementos del navbar y agregar el evento de clic para el menú móvil
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuIcon = document.getElementById("menuIcon");

// Función para mostrar u ocultar el menú móvil
function toggleMobileMenu() {
  const isActive = mobileMenu.classList.toggle("active");

  // Usar operador ternario para simplificar la lógica
  menuIcon.className = isActive ? "fas fa-times" : "fas fa-bars";
}

// Agregar el evento de clic al botón del menú móvil si hay un botón del menú
if (menuToggle) {
  menuToggle.addEventListener("click", toggleMobileMenu);
}

// Cerrar el menú móvil cuando se hace clic en un enlace - usar delegación de eventos
const mobileMenuLinks = document.querySelector(".mobile-menu-links");
if (mobileMenuLinks) {
  mobileMenuLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  });
}

// --- Mostrar botones según autenticación ---
async function actualizarBotonesNavbar() {
  const noAuth = document.querySelectorAll('[data-role="no-auth"]');
  const cliente = document.querySelectorAll('[data-role="cliente"]');
  const empleado = document.querySelectorAll('[data-role="empleado"]');

  // Ocultar todos por defecto
  noAuth.forEach((el) => (el.style.display = "none"));
  cliente.forEach((el) => (el.style.display = "none"));
  empleado.forEach((el) => (el.style.display = "none"));

  try {
    const data = await getSession();
    if (data.success && data.usuario) {
      if (data.usuario.tipo === "cliente") {
        cliente.forEach((el) => (el.style.display = "flex"));
      } else if (data.usuario.tipo === "empleado") {
        empleado.forEach((el) => (el.style.display = "flex"));
      }
    } else {
      noAuth.forEach((el) => (el.style.display = "flex"));
    }
  } catch (error) {
    noAuth.forEach((el) => (el.style.display = "flex"));
  }
}

window.recargarNavbar = actualizarBotonesNavbar;
actualizarBotonesNavbar();

// --- Logout ---
function configurarEventosLogout() {
  document.querySelectorAll(".logout-btn, .logout-link").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await withButtonLoader(
          btn,
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
  });
}
configurarEventosLogout();
