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
  mobileMenuElement.addEventListener("click", function(e) {
    if (e.target.classList.contains("mobile-link")) {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  });
}

// Optimizar el evento resize usando debounce
let resizeTimeout;
window.addEventListener("resize", function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    if (window.innerWidth > 768 && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  }, 100);
});
