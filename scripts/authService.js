export const iniciarSesion = async (credenciales) => {
  const { returnOnly, ...data } = credenciales;
  console.log(returnOnly, data);
  return fetch("/api/auth/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (returnOnly) return data;
      if (data.success) {
        if (data.usuario.tipo === "empleado") {
          alert(data.message);
          window.location.href = "admin-page.html";
        } else if (data.usuario.tipo === "cliente") {
          alert(data.message);
          window.location.href = "/index.html";
        } else {
          alert("Tipo de usuario no reconocido");
        }
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

export const registrarCliente = async (dataFormulario) => {
  await fetch("/api/auth/register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataFormulario),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error(error));
};

export const verificarAutenticacion = async () => {
  return fetch("/api/auth/check-session.php")
    .then((response) => response.json())
    .then((data) => {
      const rutaActual = window.location.pathname;
      const rutasPublicas = [
        "/auth.html",
        "/index.html",
        "/",
        "/room-detail.html",
      ];
      const esPublica = rutasPublicas.includes(rutaActual);

      if (!data.success || !data.usuario) {
        // No autenticado: si está en ruta privada, redirigir a login
        if (!esPublica) window.location.href = "/auth.html";
        return data;
      }

      // Si es empleado y está en ruta pública, redirigir al dashboard
      if (data.usuario.tipo === "empleado" && esPublica) {
        window.location.href = "/admin-page.html";
      }
      // Si es cliente y está en ruta privada, redirigir al home
      if (data.usuario.tipo === "cliente" && !esPublica) {
        window.location.href = "/";
      }
      return data;
    });
};

const esRutaPublica = () => {
  const rutasPublicas = ["/auth.html", "/index.html", "/", "/room-detail.html"];
  return rutasPublicas.includes(window.location.pathname);
};

export const cerrarSesion = async () => {
  await fetch("/api/auth/logout.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Sesion cerrada exitosamente");
        window.location.href = "/";
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error(error));
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
