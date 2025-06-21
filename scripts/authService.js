export const iniciarSesion = async () => {
  const credenciales = {
    correo: "maria@example.com",
    password: "miContraseñaSegura123", // En texto plano (se envía via HTTPS)
  };

  await fetch("/api/auth/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Inicio de sesión exitoso", data.usuario);
      } else {
        console.error("Error:", data.error);
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
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
};

//registrarCliente();
