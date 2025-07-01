export const iniciarSesion = async (credenciales) => {
  await fetch("/api/auth/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Inicio de sesión exitoso", data.usuario);
        alert(data.message);
        window.location.href = "admin-page.html";
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error(error));
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
      if (!data.success && !esRutaPublica()) {
        window.location.href = "/";
      }
      if (data.success && esRutaPublica()) {
        window.location.href = "/admin-page.html";
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
