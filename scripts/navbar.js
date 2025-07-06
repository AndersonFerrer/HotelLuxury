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
const mobileMenuElement = document.getElementById("mobileMenu");
if (mobileMenuElement) {
  mobileMenuElement.addEventListener("click", function (e) {
    if (e.target.classList.contains("mobile-link")) {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  });
}

// Optimizar el evento resize usando debounce
let resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    if (window.innerWidth > 768 && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  }, 100);
});

async function actualizarBotonesNavbar() {
  try {
    const response = await fetch("/api/auth/check-session.php");
    const data = await response.json();
    const usuario = data.success ? data.usuario : null;

    // Desktop
    const desktopCta = document.querySelector(".desktop-cta");
    if (desktopCta) {
      if (usuario && usuario.tipo === "cliente") {
        desktopCta.innerHTML = `
          <button id="logout-btn" class="btn btn-outline">Cerrar Sesión</button>
          <a href="/mi-cuenta.html" class="btn btn-primary">Mi Cuenta</a>
        `;
      } else {
        desktopCta.innerHTML = `
          <a href="auth.html" class="btn btn-outline">Iniciar Sesión</a>
          <a href="../auth.html" class="btn btn-primary">Reservar Ahora</a>
        `;
      }
    }

    // Mobile
    const mobileCta = document.querySelector(".mobile-cta");
    if (mobileCta) {
      if (usuario && usuario.tipo === "cliente") {
        mobileCta.innerHTML = `
          <button id="logout-btn-mobile" class="mobile-btn-outline">Cerrar Sesión</button>
          <a href="/mi-cuenta.html" class="mobile-btn-primary">Mi Cuenta</a>
        `;
      } else {
        mobileCta.innerHTML = `
          <a href="auth.html" class="mobile-btn-outline">Iniciar Sesión</a>
          <a href="../auth.html" class="mobile-btn-primary">Reservar Ahora</a>
        `;
      }
    }

    // Asignar evento cerrar sesión
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        const mod = await import("./authService.js");
        mod.cerrarSesion();
      });
    document
      .getElementById("logout-btn-mobile")
      ?.addEventListener("click", async () => {
        const mod = await import("./authService.js");
        mod.cerrarSesion();
      });
  } catch (e) {
    // Si hay error, dejar los botones por defecto
  }
}

// Esperar a que el DOM esté listo y el navbar cargado
window.addEventListener("DOMContentLoaded", actualizarBotonesNavbar);
// Si el navbar se recarga dinámicamente, también puedes llamar a actualizarBotonesNavbar() después de cargar el HTML del navbar.
