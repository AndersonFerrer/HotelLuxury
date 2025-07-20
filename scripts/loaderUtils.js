// Utilidades para manejar loaders y estados de carga

/**
 * Muestra un modal de carga global
 * @param {string} message - Mensaje a mostrar
 */
export function showLoadingModal(message = "Cargando...") {
  let modal = document.getElementById("loading-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "loading-modal";
    modal.className = "loading-modal";
    modal.innerHTML = `
      <div class="loading-modal-content">
        <div class="loading-modal-spinner"></div>
        <p class="loading-modal-text">${message}</p>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    const textElement = modal.querySelector(".loading-modal-text");
    if (textElement) {
      textElement.textContent = message;
    }
  }

  modal.classList.add("active");
}

/**
 * Oculta el modal de carga global
 */
export function hideLoadingModal() {
  const modal = document.getElementById("loading-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

/**
 * Convierte un botón en estado de carga
 * @param {HTMLElement} button - Elemento botón
 * @param {string} originalText - Texto original del botón
 */
export function setButtonLoading(button, originalText = null) {
  if (!button) return;

  // Guardar texto original si no se proporciona
  if (!originalText) {
    originalText = button.textContent || button.innerText;
  }

  // Guardar texto original en data attribute
  button.setAttribute("data-original-text", originalText);

  // Aplicar estado de carga
  button.classList.add("loading");
  button.disabled = true;
}

/**
 * Restaura un botón desde estado de carga
 * @param {HTMLElement} button - Elemento botón
 */
export function setButtonNormal(button) {
  if (!button) return;

  // Remover estado de carga
  button.classList.remove("loading");
  button.disabled = false;

  // Restaurar texto original
  const originalText = button.getAttribute("data-original-text");
  if (originalText) {
    button.textContent = originalText;
  }
}

/**
 * Wrapper para funciones async con loader en botón
 * @param {HTMLElement} button - Botón a mostrar loader
 * @param {Function} asyncFunction - Función async a ejecutar
 * @param {string} loadingText - Texto opcional para mostrar durante carga
 * @returns {Promise} - Resultado de la función async
 */
export async function withButtonLoader(
  button,
  asyncFunction,
  loadingText = null
) {
  try {
    setButtonLoading(button, loadingText);
    const result = await asyncFunction();
    return result;
  } finally {
    setButtonNormal(button);
  }
}

/**
 * Wrapper para funciones async con modal de carga
 * @param {Function} asyncFunction - Función async a ejecutar
 * @param {string} loadingMessage - Mensaje para el modal
 * @returns {Promise} - Resultado de la función async
 */
export async function withLoadingModal(
  asyncFunction,
  loadingMessage = "Procesando..."
) {
  try {
    showLoadingModal(loadingMessage);
    const result = await asyncFunction();
    return result;
  } finally {
    hideLoadingModal();
  }
}

/**
 * Agrega clase de carga a una sección
 * @param {HTMLElement} element - Elemento a mostrar loader
 */
export function setSectionLoading(element) {
  if (element) {
    element.classList.add("section-loading");
  }
}

/**
 * Remueve clase de carga de una sección
 * @param {HTMLElement} element - Elemento a remover loader
 */
export function setSectionNormal(element) {
  if (element) {
    element.classList.remove("section-loading");
  }
}

/**
 * Agrega clase de carga a una tabla
 * @param {HTMLElement} table - Tabla a mostrar loader
 */
export function setTableLoading(table) {
  if (table) {
    table.classList.add("table-loading");
  }
}

/**
 * Remueve clase de carga de una tabla
 * @param {HTMLElement} table - Tabla a remover loader
 */
export function setTableNormal(table) {
  if (table) {
    table.classList.remove("table-loading");
  }
}

/**
 * Agrega clase de carga a un input
 * @param {HTMLElement} input - Input a mostrar loader
 */
export function setInputLoading(input) {
  if (input) {
    input.classList.add("input-loading");
  }
}

/**
 * Remueve clase de carga de un input
 * @param {HTMLElement} input - Input a remover loader
 */
export function setInputNormal(input) {
  if (input) {
    input.classList.remove("input-loading");
  }
}

/**
 * Muestra un toast de éxito
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 3000)
 */
export function showSuccessToast(message, duration = 3000) {
  showToast(message, "success", duration);
}

/**
 * Muestra un toast de error
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 5000)
 */
export function showErrorToast(message, duration = 5000) {
  showToast(message, "error", duration);
}

/**
 * Muestra un toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, error, info)
 * @param {number} duration - Duración en ms
 */
function showToast(message, type = "info", duration = 3000) {
  // Crear contenedor de toasts si no existe
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Crear toast
  const toast = document.createElement("div");
  toast.style.cssText = `
    background: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"
    };
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;

  // Agregar toast al contenedor
  toastContainer.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remover después del tiempo especificado
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}
