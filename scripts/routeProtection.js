// Script de protección de rutas
// Incluir este script en todas las páginas para verificar acceso

import {
  verificarAutenticacion,
  verificarAccesoRuta,
  getSession,
} from "./authService.js";

// Función para proteger una página específica
export const protegerPagina = async (tipoRequerido = null) => {
  try {
    const resultado = await verificarAutenticacion();
    if (!resultado.success || !resultado.usuario) {
      return false;
    }
    console.log(resultado);
    if (tipoRequerido && resultado.usuario.tipo !== tipoRequerido) {
      if (resultado.usuario.tipo === "empleado") {
        window.location.href = "/admin-page.html#dashboard";
      } else {
        window.location.href = "/";
      }
      return false;
    }
    return true;
  } catch (error) {
    window.location.href = "/auth.html";
    return false;
  }
};

// Función para verificar acceso antes de navegar
export const verificarNavegacion = async (rutaDestino) => {
  try {
    const resultado = await verificarAccesoRuta(rutaDestino);

    if (!resultado.permitido) {
      console.log("Acceso denegado a:", rutaDestino);
      window.location.href = resultado.redirigir;
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al verificar navegación:", error);
    return false;
  }
};

// Función para inicializar protección en la página
export const inicializarProteccion = async (tipoRequerido = null) => {
  await protegerPagina(tipoRequerido);
};

// Función para proteger enlaces en la página (solo en páginas que no sean admin)
export const protegerEnlaces = () => {
  // No proteger enlaces en admin-page.html para evitar conflictos con el router interno
  if (window.location.pathname.includes("admin-page.html")) {
    return;
  }

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    // Verificar si es una ruta interna
    if (
      href.startsWith("/") ||
      href.startsWith("./") ||
      href.startsWith("../")
    ) {
      event.preventDefault();

      const accesoPermitido = await verificarNavegacion(href);
      if (accesoPermitido) {
        window.location.href = href;
      }
    }
  });
};

// Función para mostrar/ocultar elementos según el tipo de usuario
export const configurarUI = async () => {
  try {
    const data = await getSession();

    if (data.success && data.usuario) {
      const usuario = data.usuario;

      // Ocultar elementos según el tipo de usuario
      const elementosCliente = document.querySelectorAll(
        '[data-role="cliente"]'
      );
      const elementosEmpleado = document.querySelectorAll(
        '[data-role="empleado"]'
      );

      if (usuario.tipo === "cliente") {
        elementosEmpleado.forEach((el) => (el.style.display = "none"));
      } else if (usuario.tipo === "empleado") {
        elementosCliente.forEach((el) => (el.style.display = "none"));
      }

      // Mostrar información del usuario
      const elementosUsuario = document.querySelectorAll("[data-user-info]");
      elementosUsuario.forEach((el) => {
        const campo = el.getAttribute("data-user-info");
        if (usuario[campo]) {
          el.textContent = usuario[campo];
        }
      });
    }
  } catch (error) {
    console.error("Error al configurar UI:", error);
  }
};

// Auto-inicialización cuando se carga el script
document.addEventListener("DOMContentLoaded", () => {
  // Configurar UI automáticamente
  configurarUI();

  // Proteger enlaces solo si no se está en admin-page.html
  if (!window.location.pathname.includes("admin-page.html")) {
    protegerEnlaces();
  }
});
