import { getSession } from "./scripts/authService.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Verificar sesión una sola vez al cargar la página
  await getSession();

  // Cargar navbar
  fetch("./components/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-root").innerHTML = data;

      // Cargar el script del navbar como módulo ES6
      const script = document.createElement("script");
      script.type = "module";
      script.src = "./scripts/navbar.js";
      script.onload = () => {
        // Recargar el navbar para mostrar las opciones correctas según autenticación
        if (window.recargarNavbar) {
          window.recargarNavbar();
        }
      };
      document.body.appendChild(script);
    })
    .catch((error) => {
      console.error("Error al cargar el navbar:", error);
    });

  // Cargar footer
  fetch("./components/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-root").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error al cargar el footer:", error);
    });
});
