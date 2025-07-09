// Script de protección para páginas públicas
// Incluir este script en páginas públicas como index.html, contact.html, etc.

import { verificarAutenticacion, getSession } from "./authService.js";

// Función para inicializar protección en páginas públicas
export const inicializarProteccionPublica = async () => {
  try {
    console.log("Inicializando protección de página pública...");

    const resultado = await verificarAutenticacion();

    // Si hay usuario autenticado, la función verificarAutenticacion ya maneja los redireccionamientos
    if (resultado.success && resultado.usuario) {
      console.log(
        "Usuario autenticado en página pública:",
        resultado.usuario.tipo
      );

      // Los redireccionamientos se manejan automáticamente en verificarAutenticacion
      // según el tipo de usuario y la ruta actual
    } else {
      console.log(
        "No hay usuario autenticado, permitiendo acceso a página pública"
      );
    }

    return true;
  } catch (error) {
    console.error("Error al inicializar protección pública:", error);
    return false;
  }
};

// Función para verificar si un usuario puede acceder a una funcionalidad específica
export const verificarAccesoFuncionalidad = async (funcionalidad) => {
  try {
    const data = await getSession();

    if (!data.success || !data.usuario) {
      return {
        permitido: false,
        redirigir: "/auth.html",
        mensaje: "Debe iniciar sesión para acceder a esta funcionalidad",
      };
    }

    const usuario = data.usuario;

    // Verificar permisos según funcionalidad
    switch (funcionalidad) {
      case "reservar":
        // Solo clientes pueden reservar
        if (usuario.tipo === "cliente") {
          return { permitido: true };
        } else {
          return {
            permitido: false,
            redirigir: "/admin-page.html",
            mensaje: "Solo los clientes pueden realizar reservas",
          };
        }

      case "ver_detalles":
        // Cualquier usuario autenticado puede ver detalles
        return { permitido: true };

      case "contactar":
        // Cualquier usuario puede contactar
        return { permitido: true };

      default:
        return { permitido: true };
    }
  } catch (error) {
    console.error("Error al verificar acceso a funcionalidad:", error);
    return {
      permitido: false,
      redirigir: "/auth.html",
      mensaje: "Error al verificar permisos",
    };
  }
};

// Función para proteger botones/enlaces específicos
export const protegerElementos = () => {
  // Proteger botones de reserva
  document
    .querySelectorAll('[data-funcionalidad="reservar"]')
    .forEach((elemento) => {
      elemento.addEventListener("click", async (e) => {
        e.preventDefault();

        const resultado = await verificarAccesoFuncionalidad("reservar");

        if (resultado.permitido) {
          // Continuar con la acción
          const href = elemento.getAttribute("href");
          if (href) {
            window.location.href = href;
          }
        } else {
          alert(resultado.mensaje);
          if (resultado.redirigir) {
            window.location.href = resultado.redirigir;
          }
        }
      });
    });

  // Proteger enlaces de detalles
  document
    .querySelectorAll('[data-funcionalidad="ver_detalles"]')
    .forEach((elemento) => {
      elemento.addEventListener("click", async (e) => {
        e.preventDefault();

        const resultado = await verificarAccesoFuncionalidad("ver_detalles");

        if (resultado.permitido) {
          const href = elemento.getAttribute("href");
          if (href) {
            window.location.href = href;
          }
        } else {
          alert(resultado.mensaje);
          if (resultado.redirigir) {
            window.location.href = resultado.redirigir;
          }
        }
      });
    });
};

// Auto-inicialización
document.addEventListener("DOMContentLoaded", async () => {
  await inicializarProteccionPublica();
  protegerElementos();
});
