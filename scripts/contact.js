document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Obtener los valores del formulario
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      // Aquí podemos agregar la lógica para enviar el formulario

      // Simulación de envío exitoso
      alert(
        `Gracias ${name} por tu mensaje. Te contactaremos pronto en ${email}.`
      );

      // Limpiar el formulario
      contactForm.reset();
    });
  }
});
