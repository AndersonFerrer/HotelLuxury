import {
  setTableLoading,
  setTableNormal,
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

// Datos estáticos de huéspedes (simulando la base de datos)
const tiposDocumento = [
  { id_tipo_documento: 1, nombre: "DNI" },
  { id_tipo_documento: 2, nombre: "Pasaporte" },
  { id_tipo_documento: 3, nombre: "Carnet de Extranjería" },
];

let huespedes = [];

// Variables globales
let filteredGuests = [...huespedes];

// Funciones de utilidad
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(nombres, apellidos) {
  return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}

function getStatusBadge(status) {
  // Normalizamos el estado para que sea case-insensitive y sin espacios
  const normalized = status ? status.toString().trim().toLowerCase() : '';
  const statusConfig = {
    pendiente: {
      class: "status-pendiente",
      icon: "fas fa-hourglass-half",
      text: "Pendiente",
      color: "#fbbf24"
    },
    confirmada: {
      class: "status-confirmada",
      icon: "fas fa-check-circle",
      text: "Confirmada",
      color: "#10b981"
    },
    activa: {
      class: "status-activa",
      icon: "fas fa-play-circle",
      text: "Activa",
      color: "#3b82f6"
    },
    completada: {
      class: "status-completada",
      icon: "fas fa-flag-checkered",
      text: "Completada",
      color: "#6366f1"
    },
    cancelada: {
      class: "status-cancelada",
      icon: "fas fa-times-circle",
      text: "Cancelada",
      color: "#ef4444"
    },
    checkin: {
      class: "status-checkin",
      icon: "fas fa-user-check",
      text: "En Hotel",
      color: "#10b981"
    },
    checkout: {
      class: "status-checkout",
      icon: "fas fa-clock",
      text: "Check-out",
      color: "#6b7280"
    },
    reserva_activa: {
      class: "status-activa",
      icon: "fas fa-play-circle",
      text: "Activa",
      color: "#3b82f6"
    },
    reserva_pendiente: {
      class: "status-pendiente",
      icon: "fas fa-hourglass-half",
      text: "Pendiente",
      color: "#fbbf24"
    }
  };
  const config = statusConfig[normalized] || {
    class: "status-desconocido",
    icon: "fas fa-question-circle",
    text: status,
    color: "#9ca3af"
  };
  return `<span class="status-badge ${config.class}" style="background: ${config.color}22; color: ${config.color}; border-radius: 16px; padding: 0.25em 0.7em; font-weight: 500; display: inline-flex; align-items: center; gap: 0.4em; font-size: 0.97em;">
    <i class="${config.icon}" style="margin-right: 0.3em;"></i> ${config.text}
  </span>`;
}

function getDocumentTypeName(id) {
  const tipo = tiposDocumento.find((t) => t.id_tipo_documento === id);
  return tipo ? tipo.nombre : "N/A";
}

// Funciones de estadísticas
function updateStats(stats) {
  document.getElementById("total-huespedes").textContent = stats.total_huespedes ?? 0;
  document.getElementById("en-hotel").textContent = stats.en_hotel ?? 0;
  document.getElementById("reservas-activas").textContent = stats.reservas_activas ?? 0;
  document.getElementById("total-reservas").textContent = stats.total_reservas ?? 0;
}

// Funciones de filtrado
function filterGuests() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;
  const documentTypeFilter = document.getElementById(
    "document-type-filter"
  ).value;

  filteredGuests = huespedes.filter((guest) => {
    const fullName = `${guest.nombres} ${guest.apellidos}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm) ||
      guest.numero_documento.includes(searchTerm) ||
      guest.cliente.persona.correo.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || guest.estado_actual === statusFilter;
    const matchesDocumentType =
      documentTypeFilter === "all" ||
      guest.id_tipo_documento.toString() === documentTypeFilter;

    return matchesSearch && matchesStatus && matchesDocumentType;
  });

  updateTableHuespedes(filteredGuests);
  updateFilteredCount();
}

function updateFilteredCount() {
  document.getElementById("filtered-count").textContent = filteredGuests.length;
}

// Funciones para cargar datos (simulando backend)
async function fetchHuespedesStats() {
  try {
    const response = await fetch("api/huespedes/stats.php");
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Error al cargar estadísticas");
    updateStats(data);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    showErrorToast("Error al cargar estadísticas");
  }
}

async function fetchHuespedesAll() {
  const table = document.querySelector(".table-wrapper");

  try {
    setTableLoading(table);
    const response = await fetch("api/huespedes/getAll.php");
    const result = await response.json();
    if (!result.success)
      throw new Error(result.error || "Error al obtener huéspedes");
    updateTableHuespedes(result.data);
    huespedes = result.data;
    filteredGuests = [...result.data];
    updateFilteredCount();
  } catch (error) {
    console.error("Error al obtener huéspedes:", error);
    showErrorToast("Error al cargar huéspedes");
  } finally {
    setTableNormal(table);
  }
}

// Función para actualizar la tabla de huéspedes
function updateTableHuespedes(data) {
  const tbody = document.getElementById("huespedes-tbody");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>No se encontraron huéspedes</h3>
            <p>No hay huéspedes que coincidan con los filtros aplicados.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ""; // Limpiar

  data.forEach((guest) => {
    const fila = `
      <tr class="huesped-fila">
        <td class="huesped-id" style="display: none;">${guest.id_huesped}</td>
        <td>
          <div style="display: flex; align-items: center;">
            <div class="guest-avatar">
              ${getInitials(guest.nombres, guest.apellidos)}
            </div>
            <div class="guest-info">
              <div class="guest-name">${guest.nombres} ${guest.apellidos}</div>
              <div class="guest-email">
                <i class="fas fa-envelope"></i>
                ${guest.cliente.persona.correo}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="document-info">
            <div class="document-number">${guest.numero_documento}</div>
            <div class="document-type">${getDocumentTypeName(
              guest.id_tipo_documento
            )}</div>
          </div>
        </td>
        <td>
          <div class="reservation-info">
            <div class="reservation-room">
              Hab. ${guest.reserva.habitacion.numero} - ${
      guest.reserva.habitacion.tipo
    }
            </div>
            <div class="reservation-dates">
              ${formatDate(guest.reserva.fecha_checkin)} - ${formatDate(
      guest.reserva.fecha_checkout
    )}
            </div>
          </div>
        </td>
        <td>${getStatusBadge(guest.reserva && guest.reserva.estado ? guest.reserva.estado : guest.estado_actual)}</td>
        <td>
          <div class="historial-info">
            <div class="historial-number">${guest.historial_reservas}</div>
            <div class="historial-label">reservas</div>
          </div>
        </td>
        <td>
          ${
            guest.ultima_estancia
              ? formatDate(guest.ultima_estancia)
              : '<span style="color: #9ca3af;">Primera vez</span>'
          }
        </td>
        <td class="acciones">
          <button class="action-btn info" title="Ver">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", fila);
  });
}

// Configuración del modal
const modal = document.getElementById("modal-huesped");
const modalContenido = document.getElementById("modal-contenido");
const modalTitulo = document.getElementById("modal-titulo");
const modalActions = document.getElementById("modal-actions");

// Función para cerrar modal al hacer clic en backdrop
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.close();
  }
});

// Inicialización
await fetchHuespedesStats();
await fetchHuespedesAll();

// Funciones para generar contenido del modal
function generarModalVisualHuesped(huesped) {
  console.log(huesped);
  // Buscar detalles extendidos de la habitación si existen
  let habitacionExtra = null;
  if (
    window.tipos_habitaciones &&
    huesped.reserva &&
    huesped.reserva.habitacion
  ) {
    const tipoId =
      huesped.reserva.habitacion.id_tipo_habitacion ||
      huesped.reserva.habitacion.tipo_habitacion ||
      huesped.reserva.habitacion.tipo;
    habitacionExtra = window.tipos_habitaciones.find(
      (t) =>
        t.id_tipo_habitacion == tipoId ||
        t.nombre == huesped.reserva.habitacion.tipo
    );
  }
  return `
    <div style="padding:0.5rem 0;">
      <div class="guest-details-grid">
        <div class="detail-card">
          <h3>
            <div class="guest-avatar" style="margin: 0;">
              ${getInitials(huesped.nombres, huesped.apellidos)}
            </div>
            Información Personal
          </h3>
          <div class="detail-item">
            <i class="fas fa-user"></i>
            <span class="detail-label">Nombre:</span>
            <span class="detail-value"><strong>${huesped.nombres} ${
    huesped.apellidos
  }</strong></span>
          </div>
          <div class="detail-item">
            <i class="fas fa-id-card"></i>
            <span class="detail-label">Documento:</span>
            <span class="detail-value">${
              huesped.numero_documento
            } (${getDocumentTypeName(huesped.id_tipo_documento)})</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-phone"></i>
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">${
              huesped.cliente.persona.telefono
            }</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-envelope"></i>
            <span class="detail-label">Email:</span>
            <span class="detail-value">${huesped.cliente.persona.correo}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span class="detail-label">Fecha de Nacimiento:</span>
            <span class="detail-value">${formatDate(
              huesped.cliente.persona.fecha_nacimiento
            )}</span>
          </div>
        </div>

        <div class="detail-card">
          <h3><i class="fas fa-building"></i> Reserva Actual</h3>
          <div class="detail-item">
            <i class="fas fa-bed"></i>
            <span class="detail-label">Habitación:</span>
            <span class="detail-value">${huesped.reserva.habitacion.numero} - ${
    huesped.reserva.habitacion.tipo
  }</span>
          </div>
          ${
            habitacionExtra
              ? `
          <div class="detail-item">
            <i class="fas fa-cube"></i>
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${habitacionExtra.nombre}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-coins"></i>
            <span class="detail-label">Precio por noche:</span>
            <span class="detail-value">S/. ${
              habitacionExtra.precio_noche
            }</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-list"></i>
            <span class="detail-label">Características:</span>
            <span class="detail-value">${
              habitacionExtra.caracteristicas
                ? habitacionExtra.caracteristicas.join(", ")
                : "N/A"
            }</span>
          </div>
          `
              : ""
          }
          <div class="detail-item">
            <i class="fas fa-calendar-check"></i>
            <span class="detail-label">Check-in:</span>
            <span class="detail-value">${formatDate(
              huesped.reserva.fecha_checkin
            )}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-times"></i>
            <span class="detail-label">Check-out:</span>
            <span class="detail-value">${formatDate(
              huesped.reserva.fecha_checkout
            )}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">${getStatusBadge(
              huesped.reserva && huesped.reserva.estado ? huesped.reserva.estado : huesped.estado_actual
            )}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total:</span>
            <span class="detail-value"><strong style="color: #d4af37;">S/. ${huesped.reserva.total.toFixed(
              2
            )}</strong></span>
          </div>
        </div>

        <div class="detail-card full-width-card">
          <h3><i class="fas fa-map-marker-alt"></i> Dirección</h3>
          <p class="address-text">
            ${huesped.cliente.persona.direccion.direccion_detallada}, 
            ${huesped.cliente.persona.direccion.distrito}, 
            ${huesped.cliente.persona.direccion.provincia}, 
            ${huesped.cliente.persona.direccion.region}
          </p>
        </div>

        <div class="detail-card full-width-card">
          <h3><i class="fas fa-history"></i> Historial de Estancias</h3>
          <div class="detail-item">
            <span class="detail-label">Total de reservas:</span>
            <span class="detail-value"><strong style="color: #d4af37;">${
              huesped.historial_reservas
            }</strong></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Última estancia:</span>
            <span class="detail-value">${
              huesped.ultima_estancia
                ? formatDate(huesped.ultima_estancia)
                : "Primera vez"
            }</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado actual:</span>
            <span class="detail-value">${getStatusBadge(
              huesped.estado_actual
            )}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generarFormularioAgregarHuesped() {
  const tipoOptions = tiposDocumento
    .map(
      (tipo) =>
        `<option value="${tipo.id_tipo_documento}">${tipo.nombre}</option>`
    )
    .join("");

  return `
    <form id="form-agregar-huesped" style="min-width:320px;max-width:500px;margin:auto;">
      <div class="form-row">
        <div class="form-group">
          <label for="nombres"><strong>Nombres</strong></label>
          <input id="nombres" class="form-input" type="text" style="width:100%;margin-bottom:1rem;" required />
        </div>
        <div class="form-group">
          <label for="apellidos"><strong>Apellidos</strong></label>
          <input id="apellidos" class="form-input" type="text" style="width:100%;margin-bottom:1rem;" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="tipo-documento"><strong>Tipo de Documento</strong></label>
          <select id="tipo-documento" class="form-input" style="width:100%;margin-bottom:1rem;" required>
            <option value="">Seleccionar tipo</option>
            ${tipoOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="numero-documento"><strong>Número de Documento</strong></label>
          <input id="numero-documento" class="form-input" type="text" style="width:100%;margin-bottom:1rem;" required />
        </div>
      </div>
      <div class="form-group">
        <label for="reserva-asociada"><strong>Reserva Asociada</strong></label>
        <select id="reserva-asociada" class="form-input" style="width:100%;margin-bottom:1rem;" required>
          <option value="">Seleccionar reserva</option>
          <option value="1">Reserva #1 - Hab. 101 (01/02 - 05/02)</option>
          <option value="2">Reserva #2 - Hab. 201 (10/02 - 15/02)</option>
        </select>
      </div>
    </form>
  `;
}

// Función para configurar eventos de las filas
function configurarEventosFilas() {
  document.querySelectorAll(".huesped-fila").forEach((fila) => {
    const verBtn = fila.querySelector(".action-btn.info");

    verBtn.addEventListener("click", () => {
      const idHuesped = fila.querySelector(".huesped-id")?.textContent;
      const huesped = huespedes.find(
        (g) => g.id_huesped === parseInt(idHuesped)
      );
      if (!huesped) return;

      modalTitulo.textContent = `Detalles del Huésped - ${huesped.nombres} ${huesped.apellidos}`;
      modalContenido.innerHTML = generarModalVisualHuesped(huesped);
      modal.showModal();
      modalActions.innerHTML = `<button type="button" class="btn-cancelar">
        <i class="fas fa-times"></i>
        Cancelar
      </button>`;
      modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
    });
  });
}

// Configurar eventos después de cargar datos
configurarEventosFilas();

// Botón nuevo huésped
const btnNuevoHuesped = document.querySelector("#btn-nuevo-huesped");
const btnCerrar = document.querySelector(".btn-cancelar");

btnCerrar?.addEventListener("click", () => {
  modal.close();
});

btnNuevoHuesped?.addEventListener("click", () => {
  modalTitulo.textContent = "Registrar Nuevo Huésped";
  modalContenido.innerHTML = generarFormularioAgregarHuesped();
  modal.showModal();
  modalActions.innerHTML = `
    <button type="button" class="btn-cancelar">
      <i class="fas fa-times"></i>
      Cancelar
    </button>
    <button type="submit" class="btn-confirmar-agregar">
      <i class="fas fa-user-plus"></i>
      Registrar Huésped
    </button>
  `;
  modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
  modalActions.querySelector(".btn-confirmar-agregar").onclick = async (e) => {
    e.preventDefault();
    const nombres = document.getElementById("nombres").value;
    const apellidos = document.getElementById("apellidos").value;
    const id_tipo_documento = document.getElementById("tipo-documento").value;
    const numero_documento = document.getElementById("numero-documento").value;
    const id_reserva = document.getElementById("reserva-asociada").value;

    if (
      !nombres ||
      !apellidos ||
      !id_tipo_documento ||
      !numero_documento ||
      !id_reserva
    ) {
      showErrorToast("Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch("api/huespedes/insert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres,
          apellidos,
          id_tipo_documento,
          numero_documento,
          id_reserva,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al agregar huésped");
      }
      await fetchHuespedesAll();
      await fetchHuespedesStats();
      modal.close();
      showSuccessToast("Huésped agregado con éxito");
    } catch (error) {
      console.error("Error:", error);
      showErrorToast("Error al agregar huésped: " + error.message);
    }
  };
});

// Event listeners para filtros
document
  .getElementById("search-input")
  ?.addEventListener("input", filterGuests);
document
  .getElementById("status-filter")
  ?.addEventListener("change", filterGuests);
document
  .getElementById("document-type-filter")
  ?.addEventListener("change", filterGuests);

// Escuchar cambios en la URL para recargar datos
window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "clientes") {
    await fetchHuespedesAll();
    await fetchHuespedesStats();
  }
});
