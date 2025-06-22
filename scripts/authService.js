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
