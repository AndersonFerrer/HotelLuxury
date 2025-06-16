document.addEventListener("DOMContentLoaded", function () {
  // Cargar navbar
  fetch("./components/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-root").innerHTML = data;
      // Cargar el script del navbar después de que el HTML esté cargado
      const script = document.createElement("script");
      script.src = "./scripts/navbar.js";
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
