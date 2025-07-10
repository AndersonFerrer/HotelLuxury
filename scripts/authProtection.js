import { getSession } from "./authService.js";

/**
 * Protege la página de auth para que usuarios ya autenticados no puedan acceder
 */
export const protegerPaginaAuth = async () => {
  try {
    const data = await getSession();

    // Validar que data existe y tiene la estructura esperada
    if (!data || typeof data !== "object") {
      console.log(
        "No se pudo obtener datos de sesión, permitiendo acceso a auth"
      );
      return;
    }

    // Si el usuario está autenticado, redirigir según su tipo
    if (data.success && data.usuario) {
      const usuario = data.usuario;

      if (usuario.tipo === "empleado") {
        console.log(
          "Empleado autenticado intentando acceder a auth, redirigiendo a admin"
        );
        window.location.href = "/admin-page.html";
        return;
      } else if (usuario.tipo === "cliente") {
        console.log(
          "Cliente autenticado intentando acceder a auth, redirigiendo a home"
        );
        window.location.href = "/";
        return;
      }
    }

    // Si no está autenticado, permitir acceso a auth
    console.log("Usuario no autenticado, permitiendo acceso a auth");
  } catch (error) {
    console.error("Error al verificar autenticación en auth:", error);
    // En caso de error, permitir acceso a auth
  }
};

/**
 * Inicializa la protección de la página de auth
 */
export const inicializarProteccionAuth = async () => {
  // Esperar un poco para que la sesión se cargue completamente
  setTimeout(async () => {
    await protegerPaginaAuth();
  }, 100);
};
