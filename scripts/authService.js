// --- CACHÉ DE SESIÓN EN MEMORIA ---
let sessionCache = null;
let sessionPromise = null;

export async function getSession() {
  if (sessionCache) return sessionCache;
  if (!sessionPromise) {
    sessionPromise = fetch("/api/auth/check-session.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sessionCache = data;
          return data;
        } else {
          sessionCache = null;
          sessionPromise = null;
        }
      });
  }
  return sessionPromise;
}

export function clearSessionCache() {
  sessionCache = null;
  sessionPromise = null;
}

// --- FIN CACHÉ DE SESIÓN ---

export const iniciarSesion = async (credenciales) => {
  const { returnOnly, ...data } = credenciales;
  console.log(returnOnly, data);

  try {
    const response = await fetch("/api/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (returnOnly) return result;

    if (result.success) {
      clearSessionCache(); // Limpiar caché al iniciar sesión
      console.log(result.usuario);
      if (result.usuario.tipo === "empleado") {
        window.location.href = "admin-page.html";
      } else if (result.usuario.tipo === "cliente") {
        window.location.href = "/index.html";
      } else {
        throw new Error("Tipo de usuario no reconocido");
      }
    } else {
      throw new Error(result.error || "Error al iniciar sesión");
    }

    return result;
  } catch (error) {
    if (returnOnly) return { success: false, error: error.message };
    console.error(error);
    throw error;
  }
};

export const registrarCliente = async (dataFormulario) => {
  try {
    const response = await fetch("/api/auth/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataFormulario),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// Configuración de rutas por tipo de usuario
const RUTAS_CONFIG = {
  publicas: [
    "/auth.html",
    "/index.html",
    "/",
    "/room-detail.html",
    "/contact.html",
  ],
  cliente: ["/mi-cuenta.html"],
  empleado: [
    "/admin-page.html",
    "/admin-page.html#dashboard",
    "/admin-page.html#reservas",
    "/admin-page.html#habitaciones",
    "/admin-page.html#clientes",
    "/admin-page.html#empleados",
    "/admin-page.html#pagos",
    "/admin-page.html#configuracion",
  ],
};

const esRutaDeTipo = (ruta, tipo) => {
  // Extraer la ruta base sin hashtag para comparación
  const rutaBase = ruta.split("#")[0];

  return (
    RUTAS_CONFIG[tipo]?.some((rutaConfig) => {
      const configBase = rutaConfig.split("#")[0];
      return (
        rutaBase === configBase ||
        rutaBase.startsWith(configBase.replace(".html", ""))
      );
    }) || false
  );
};

const esRutaPublica = (ruta) => {
  // Extraer la ruta base sin hashtag para comparación
  const rutaBase = ruta.split("#")[0];

  return RUTAS_CONFIG.publicas.some((rutaPublica) => {
    const configBase = rutaPublica.split("#")[0];
    return (
      rutaBase === configBase ||
      rutaBase.startsWith(configBase.replace(".html", ""))
    );
  });
};

export const verificarAutenticacion = async () => {
  try {
    const data = await getSession();

    const rutaActual = window.location.pathname + window.location.hash;
    const rutaBase = window.location.pathname;
    const esPublica = esRutaPublica(rutaBase);
    const esRutaCliente = esRutaDeTipo(rutaBase, "cliente");
    const esRutaEmpleado = esRutaDeTipo(rutaBase, "empleado");

    if (!data.success || !data.usuario) {
      if (!esPublica) {
        console.log("No autenticado en ruta privada, redirigiendo a login");
        window.location.href = "/auth.html";
        return data;
      }
      return data;
    }

    const usuario = data.usuario;
    console.log("Usuario autenticado:", usuario.tipo, "en ruta:", rutaActual);

    if (usuario.tipo === "empleado") {
      if (esRutaCliente) {
        console.log(
          "Empleado intentando acceder a ruta de cliente, redirigiendo a admin"
        );
        window.location.href = "/admin-page.html#dashboard";
        return data;
      }
      if (esPublica) {
        console.log("Empleado en ruta pública, redirigiendo a admin");
        window.location.href = "/admin-page.html#dashboard";
        return data;
      }
      if (esRutaEmpleado) {
        return data;
      }
    }

    if (usuario.tipo === "cliente") {
      if (esRutaEmpleado) {
        console.log(
          "Cliente intentando acceder a ruta de empleado, redirigiendo a home"
        );
        window.location.href = "/";
        return data;
      }
      if (esRutaCliente) {
        return data;
      }
      if (esPublica) {
        return data;
      }
    }

    console.log("Ruta no configurada, redirigiendo según tipo de usuario");
    if (usuario.tipo === "empleado") {
      window.location.href = "/admin-page.html#dashboard";
    } else {
      window.location.href = "/";
    }

    return data;
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    window.location.href = "/auth.html";
    return { success: false, error: error.message };
  }
};

export const verificarAccesoRuta = async (rutaDestino) => {
  try {
    const data = await getSession();

    if (!data.success || !data.usuario) {
      return { permitido: false, redirigir: "/auth.html" };
    }

    const usuario = data.usuario;
    // Extraer la ruta base sin hashtag para comparación
    const rutaBase = rutaDestino.split("#")[0];
    const esPublica = esRutaPublica(rutaBase);
    const esRutaCliente = esRutaDeTipo(rutaBase, "cliente");
    const esRutaEmpleado = esRutaDeTipo(rutaBase, "empleado");

    if (esPublica) {
      return { permitido: true };
    }

    if (usuario.tipo === "empleado") {
      if (esRutaEmpleado) {
        return { permitido: true };
      } else {
        return { permitido: false, redirigir: "/admin-page.html#dashboard" };
      }
    }

    if (usuario.tipo === "cliente") {
      if (esRutaCliente) {
        return { permitido: true };
      } else {
        return { permitido: false, redirigir: "/" };
      }
    }

    return { permitido: false, redirigir: "/auth.html" };
  } catch (error) {
    console.error("Error al verificar acceso:", error);
    return { permitido: false, redirigir: "/auth.html" };
  }
};

export const cerrarSesion = async () => {
  try {
    const response = await fetch("/api/auth/logout.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    clearSessionCache(); // Limpiar caché al cerrar sesión

    return result;
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

export const iniciarSesionEmpleado = async (credenciales) => {
  const { returnOnly, ...data } = credenciales;
  return fetch("/api/auth/loginEmpleado.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (returnOnly) return data;
      if (data.success) {
        clearSessionCache(); // Limpiar caché al iniciar sesión
        console.log("Inicio de sesión exitoso (empleado)", data.empleado);
        alert(data.message);
        window.location.href = "admin-page.html";
      } else {
        alert(data.error);
      }
      return data;
    })
    .catch((error) => {
      if (returnOnly) return { success: false, error: error.message };
      console.error(error);
    });
};
