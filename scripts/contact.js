import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const formFields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    subject: document.getElementById("subject"),
    message: document.getElementById("message")
  };

  // Función para validar campos individuales
  const validators = {
    name: (value) => {
      if (!value.trim()) return "El nombre es requerido";
      if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
      return null;
    },
    email: (value) => {
      if (!value.trim()) return "El email es requerido";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Por favor ingresa un email válido";
      return null;
    },
    subject: (value) => {
      if (!value.trim()) return "El asunto es requerido";
      if (value.trim().length < 5) return "El asunto debe tener al menos 5 caracteres";
      return null;
    },
    message: (value) => {
      if (!value.trim()) return "El mensaje es requerido";
      if (value.trim().length < 10) return "El mensaje debe tener al menos 10 caracteres";
      return null;
    }
  };

  // Agregar validación en tiempo real para cada campo
  Object.keys(formFields).forEach(fieldName => {
    const field = formFields[fieldName];
    if (field) {
      // Validar al perder el foco
      field.addEventListener("blur", function() {
        validateField(fieldName, field.value);
      });
      
      // Limpiar error al comenzar a escribir
      field.addEventListener("input", function() {
        const errorElement = field.parentElement.querySelector(".field-error");
        if (errorElement) errorElement.remove();
        field.classList.remove("input-error");
      });
    }
  });

  // Función para validar un campo individual
  function validateField(fieldName, value) {
    const field = formFields[fieldName];
    const errorMessage = validators[fieldName](value);
    
    // Eliminar mensaje de error anterior si existe
    const existingError = field.parentElement.querySelector(".field-error");
    if (existingError) existingError.remove();
    
    // Si hay error, mostrar mensaje
    if (errorMessage) {
      const errorElement = document.createElement("div");
      errorElement.className = "field-error";
      errorElement.textContent = errorMessage;
      field.parentElement.appendChild(errorElement);
      field.classList.add("input-error");
      return false;
    }
    
    field.classList.remove("input-error");
    return true;
  }

  // Función para validar todo el formulario
  function validateForm() {
    let isValid = true;
    
    Object.keys(formFields).forEach(fieldName => {
      const field = formFields[fieldName];
      if (!validateField(fieldName, field.value)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      
      // Validar formulario completo
      if (!validateForm()) {
        return;
      }

      // Recopilar datos del formulario
      const formData = {
        name: formFields.name.value.trim(),
        email: formFields.email.value.trim(),
        subject: formFields.subject.value.trim(),
        message: formFields.message.value.trim(),
      };

      try {
        await withButtonLoader(
          submitBtn,
          async () => {
            // Intentar enviar el mensaje al backend
            try {
              // Opción 1: Usar API real (descomentar cuando esté disponible)
              /*
              const response = await fetch('/api/contact/send.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el mensaje');
              }
              
              const result = await response.json();
              */
              
              // Opción 2: Simulación (usar mientras no haya backend)
              await new Promise((resolve) => setTimeout(resolve, 1500));
              const success = Math.random() > 0.1; // 90% de éxito
              
              if (!success) {
                throw new Error("Error al enviar el mensaje");
              }
              
              // Guardar en localStorage para historial de mensajes (opcional)
              saveContactHistory(formData);
              
              showSuccessToast(
                `Gracias ${formData.name} por tu mensaje. Te contactaremos pronto en ${formData.email}.`
              );

              // Limpiar el formulario
              contactForm.reset();
              
              return { success: true };
            } catch (error) {
              console.error("Error en la petición:", error);
              throw error;
            }
          },
          {
            loadingText: "Enviando mensaje...",
            showText: true,
            spinnerPosition: "left"
          }
        );
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        showErrorToast("Error al enviar el mensaje. Inténtalo de nuevo más tarde.");
      }
    });
  }
  
  // Función para guardar historial de mensajes enviados
  function saveContactHistory(formData) {
    try {
      const history = JSON.parse(localStorage.getItem('contactHistory') || '[]');
      history.push({
        ...formData,
        date: new Date().toISOString()
      });
      // Mantener solo los últimos 10 mensajes
      if (history.length > 10) {
        history.shift();
      }
      localStorage.setItem('contactHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Error al guardar historial:', e);
    }
  }
});
