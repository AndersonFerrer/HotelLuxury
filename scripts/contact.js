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

  // Crear honeypot para prevenir bots
  const honeypot = createHoneypot();
  
  // Configurar autoguardado
  const { clearDraft } = setupAutosave();
  
  // Agregar contador de caracteres
  addCharacterCounter();

  // Función de debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Validadores mejorados
  const validators = {
    name: (value) => {
      if (!value.trim()) return "El nombre es requerido";
      if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
      if (value.trim().length > 50) return "El nombre no puede exceder 50 caracteres";
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return "El nombre solo puede contener letras";
      return null;
    },
    email: (value) => {
      if (!value.trim()) return "El email es requerido";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Por favor ingresa un email válido";
      if (value.length > 100) return "El email es demasiado largo";
      return null;
    },
    subject: (value) => {
      if (!value.trim()) return "El asunto es requerido";
      if (value.trim().length < 5) return "El asunto debe tener al menos 5 caracteres";
      if (value.trim().length > 100) return "El asunto no puede exceder 100 caracteres";
      return null;
    },
    message: (value) => {
      if (!value.trim()) return "El mensaje es requerido";
      if (value.trim().length < 10) return "El mensaje debe tener al menos 10 caracteres";
      if (value.trim().length > 500) return "El mensaje no puede exceder 500 caracteres";
      return null;
    }
  };

  // Validación con debounce
  const debouncedValidation = debounce((fieldName, value) => {
    validateField(fieldName, value);
  }, 300);

  // Event listeners mejorados
  Object.keys(formFields).forEach(fieldName => {
    const field = formFields[fieldName];
    if (field) {
      field.addEventListener("blur", function() {
        validateField(fieldName, field.value);
      });
      
      field.addEventListener("input", function() {
        const errorElement = field.parentElement.querySelector(".field-error");
        if (errorElement) errorElement.remove();
        field.classList.remove("input-error");
        
        // Validación con debounce solo para campos de texto largos
        if (fieldName === 'message' || fieldName === 'subject') {
          debouncedValidation(fieldName, field.value);
        }
      });
    }
  });

  // Rate limiting
  function checkRateLimit() {
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    const now = Date.now();
    const cooldownPeriod = 60000; // 1 minuto
    
    if (lastSubmission && (now - parseInt(lastSubmission)) < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastSubmission))) / 1000);
      throw new Error(`Por favor espera ${remainingTime} segundos antes de enviar otro mensaje.`);
    }
    
    localStorage.setItem('lastContactSubmission', now.toString());
  }

  // Detección de spam
  function detectSpam(formData) {
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here', 'free money'];
    const message = formData.message.toLowerCase();
    
    const hasSpamKeywords = spamKeywords.some(keyword => message.includes(keyword));
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex) || [];
    const tooManyUrls = urls.length > 2;
    
    const words = message.split(' ');
    const uniqueWords = new Set(words);
    const repetitiveText = words.length > 10 && uniqueWords.size / words.length < 0.5;
    
    return hasSpamKeywords || tooManyUrls || repetitiveText;
  }

  // Crear honeypot
  function createHoneypot() {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.cssText = 'position: absolute; left: -9999px; opacity: 0; pointer-events: none;';
    honeypot.tabIndex = -1;
    contactForm.appendChild(honeypot);
    return honeypot;
  }

  // Verificar honeypot
  function checkHoneypot(honeypot) {
    if (honeypot.value !== '') {
      throw new Error('Detección de bot. Envío bloqueado.');
    }
  }

  // Autoguardado
  function setupAutosave() {
    const autosaveKey = 'contactFormDraft';
    
    function loadDraft() {
      try {
        const draft = JSON.parse(localStorage.getItem(autosaveKey) || '{}');
        Object.keys(formFields).forEach(fieldName => {
          if (draft[fieldName] && formFields[fieldName]) {
            formFields[fieldName].value = draft[fieldName];
          }
        });
      } catch (e) {
        console.error('Error al cargar borrador:', e);
      }
    }
    
    const saveDraft = debounce(() => {
      const draft = {};
      Object.keys(formFields).forEach(fieldName => {
        draft[fieldName] = formFields[fieldName].value;
      });
      localStorage.setItem(autosaveKey, JSON.stringify(draft));
    }, 1000);
    
    Object.values(formFields).forEach(field => {
      field.addEventListener('input', saveDraft);
    });
    
    function clearDraft() {
      localStorage.removeItem(autosaveKey);
    }
    
    loadDraft();
    return { clearDraft };
  }

  // Contador de caracteres
  function addCharacterCounter() {
    const messageField = formFields.message;
    if (messageField) {
      const maxLength = 500;
      messageField.setAttribute('maxlength', maxLength);
      
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.textContent = `0/${maxLength}`;
      messageField.parentElement.appendChild(counter);
      
      messageField.addEventListener('input', function() {
        const currentLength = this.value.length;
        counter.textContent = `${currentLength}/${maxLength}`;
        counter.style.color = currentLength > maxLength * 0.9 ? '#ef4444' : '#6b7280';
      });
    }
  }

  // Resto de funciones (validateField, validateForm, etc.) permanecen igual...
  
  // Event listener del formulario mejorado
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      
      try {
        // Verificaciones de seguridad
        checkRateLimit();
        checkHoneypot(honeypot);
        
        // Validar formulario
        if (!validateForm()) {
          return;
        }

        const formData = {
          name: formFields.name.value.trim(),
          email: formFields.email.value.trim(),
          subject: formFields.subject.value.trim(),
          message: formFields.message.value.trim(),
        };

        // Verificar spam
        if (detectSpam(formData)) {
          showErrorToast("El mensaje contiene contenido no permitido. Por favor revísalo.");
          return;
        }

        await withButtonLoader(
          submitBtn,
          async () => {
            // Simulación de envío
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const success = Math.random() > 0.1;
            
            if (!success) {
              throw new Error("Error al enviar el mensaje");
            }
            
            saveContactHistory(formData);
            clearDraft(); // Limpiar borrador después del envío exitoso
            
            showSuccessToast(
              `Gracias ${formData.name} por tu mensaje. Te contactaremos pronto.`
            );

            contactForm.reset();
            return { success: true };
          },
          {
            loadingText: "Enviando mensaje...",
            showText: true,
            spinnerPosition: "left"
          }
        );
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        showErrorToast(error.message || "Error al enviar el mensaje. Inténtalo de nuevo más tarde.");
      }
    });
  }
  
  // Función para guardar historial (permanece igual)
  function saveContactHistory(formData) {
    try {
      const history = JSON.parse(localStorage.getItem('contactHistory') || '[]');
      history.push({
        ...formData,
        date: new Date().toISOString()
      });
      if (history.length > 10) {
        history.shift();
      }
      localStorage.setItem('contactHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Error al guardar historial:', e);
    }
  }
});
