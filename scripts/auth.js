document.addEventListener("DOMContentLoaded", function () {
  // Manejo de tabs
  const tabTriggers = document.querySelectorAll(".tab-trigger");
  const tabContents = document.querySelectorAll(".tab-content");

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      // Remover clase active de todos los triggers
      tabTriggers.forEach((t) => t.classList.remove("active"));

      // Añadir clase active al trigger actual
      this.classList.add("active");

      // Ocultar todos los contenidos
      tabContents.forEach((content) => content.classList.remove("active"));

      // Mostrar el contenido correspondiente
      const tabId = this.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Manejo de mostrar/ocultar contraseña
  const passwordToggles = document.querySelectorAll(".password-toggle");

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const passwordInput = this.parentElement.querySelector("input");
      const icon = this.querySelector("i");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  // Manejo del formulario de login
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      // Logica de autenticación
      console.log("Login:", { email, password });

      // Simulación de login exitoso
      alert(`Inicio de sesión exitoso para ${email}`);
    });
  }

  // Manejo del formulario de registro
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;

      // Logica de registro
      console.log("Register:", { name, email, password });

      // Simulación de registro exitoso
      alert(`Registro exitoso para ${name} (${email})`);
    });
  }
});
