import { iniciarSesion, registrarCliente } from "./authService.js";
import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

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
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const correo = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      // Validar campos
      if (!correo || !password) {
        showErrorToast("Por favor completa todos los campos");
        return;
      }

      try {
        await withButtonLoader(
          submitBtn,
          async () => {
            const result = await iniciarSesion({
              correo,
              password,
              returnOnly: true,
            });

            if (result.success) {
              showSuccessToast("Inicio de sesión exitoso");
              // La función iniciarSesion ya maneja la redirección
            } else {
              showErrorToast(result.error || "Error al iniciar sesión");
            }

            return result;
          },
          "Iniciando sesión..."
        );
      } catch (error) {
        console.error("Error en login:", error);
        showErrorToast("Error al conectar con el servidor");
      }
    });
  }

  // Manejo del formulario de registro
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');

      const formData = {
        nombres: document.getElementById("register-nombres").value,
        apellidos: document.getElementById("register-apellidos").value,
        id_tipo_documento: document.getElementById("register-tipo-documento")
          .value,
        numero_documento: document.getElementById("register-numero-documento")
          .value,
        correo: document.getElementById("register-correo").value,
        telefono: document.getElementById("register-telefono").value,
        fecha_nacimiento: document.getElementById("register-fecha-nacimiento")
          .value,
        region: document.getElementById("register-region").value,
        provincia: document.getElementById("register-provincia").value,
        distrito: document.getElementById("register-distrito").value,
        direccion_detallada: document.getElementById(
          "register-direccion-detallada"
        ).value,
        password: document.getElementById("register-password").value,
        confirmPassword: document.getElementById("register-confirm-password")
          .value,
      };

      // Validar campos requeridos
      const requiredFields = [
        "nombres",
        "apellidos",
        "id_tipo_documento",
        "numero_documento",
        "correo",
        "password",
      ];
      for (const field of requiredFields) {
        if (!formData[field]) {
          showErrorToast(`El campo ${field.replace("_", " ")} es requerido`);
          return;
        }
      }

      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        showErrorToast("Las contraseñas no coinciden");
        return;
      }

      // Validar longitud de contraseña
      if (formData.password.length < 8) {
        showErrorToast("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      try {
        await withButtonLoader(
          submitBtn,
          async () => {
            const result = await registrarCliente(formData);

            if (result.success) {
              showSuccessToast(
                "Registro exitoso. Inicia sesión con tus datos."
              );
              // Limpiar formulario
              this.reset();
              // Cambiar a tab de login
              document.querySelector('[data-tab="login"]').click();
            } else {
              showErrorToast(result.error || "Error al registrar usuario");
            }

            return result;
          },
          "Creando cuenta..."
        );
      } catch (error) {
        console.error("Error en registro:", error);
        showErrorToast("Error al conectar con el servidor");
      }
    });
  }
});
