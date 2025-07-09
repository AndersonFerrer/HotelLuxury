import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');

      // Obtener los valores del formulario
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      // Validar campos requeridos
      if (!name || !email || !subject || !message) {
        showErrorToast("Por favor completa todos los campos");
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showErrorToast("Por favor ingresa un email válido");
        return;
      }

      try {
        await withButtonLoader(
          submitBtn,
          async () => {
            // Simulación de envío (aquí se conectaría con el backend)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulación de respuesta exitosa
            const success = Math.random() > 0.1; // 90% de éxito

            if (success) {
              showSuccessToast(
                `Gracias ${name} por tu mensaje. Te contactaremos pronto en ${email}.`
              );

              // Limpiar el formulario
              contactForm.reset();
            } else {
              throw new Error("Error al enviar el mensaje");
            }

            return { success };
          },
          "Enviando mensaje..."
        );
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        showErrorToast("Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    });
  }
});
