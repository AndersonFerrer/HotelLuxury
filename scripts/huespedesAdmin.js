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

const huespedes = [
  {
    id_huesped: 1,
    nombres: "Juan Carlos",
    apellidos: "Pérez González",
    id_tipo_documento: 1,
    numero_documento: "12345678",
    reserva: {
      id_reserva: 1,
      fecha_checkin: "2024-02-01",
      fecha_checkout: "2024-02-05",
      estado: "completada",
      habitacion: {
        numero: "101",
        tipo: "Habitación Estándar",
      },
      total: 480.0,
    },
    cliente: {
      persona: {
        telefono: "+51 987654321",
        correo: "juan.perez@email.com",
        fecha_nacimiento: "1985-03-15",
        direccion: {
          region: "Lima",
          provincia: "Lima",
          distrito: "Miraflores",
          direccion_detallada: "Av. Larco 123",
        },
      },
    },
    historial_reservas: 3,
    ultima_estancia: "2024-02-05",
    estado_actual: "checkout",
  },
  {
    id_huesped: 2,
    nombres: "María Elena",
    apellidos: "López Martínez",
    id_tipo_documento: 1,
    numero_documento: "23456789",
    reserva: {
      id_reserva: 2,
      fecha_checkin: "2024-02-10",
      fecha_checkout: "2024-02-15",
      estado: "confirmada",
      habitacion: {
        numero: "201",
        tipo: "Suite Deluxe",
      },
      total: 1250.0,
    },
    cliente: {
      persona: {
        telefono: "+51 976543210",
        correo: "maria.lopez@email.com",
        fecha_nacimiento: "1990-07-22",
        direccion: {
          region: "Lima",
          provincia: "Lima",
          distrito: "San Isidro",
          direccion_detallada: "Calle Las Flores 456",
        },
      },
    },
    historial_reservas: 1,
    ultima_estancia: null,
    estado_actual: "reserva_activa",
  },
  {
    id_huesped: 3,
    nombres: "Carlos Alberto",
    apellidos: "Rodríguez Silva",
    id_tipo_documento: 1,
    numero_documento: "34567890",
    reserva: {
      id_reserva: 3,
      fecha_checkin: "2024-01-25",
      fecha_checkout: "2024-01-30",
      estado: "completada",
      habitacion: {
        numero: "301",
        tipo: "Suite Presidencial",
      },
      total: 2250.0,
    },
    cliente: {
      persona: {
        telefono: "+51 965432109",
        correo: "carlos.rodriguez@email.com",
        fecha_nacimiento: "1982-11-08",
        direccion: {
          region: "Lima",
          provincia: "Lima",
          distrito: "Surco",
          direccion_detallada: "Jr. Los Pinos 789",
        },
      },
    },
    historial_reservas: 5,
    ultima_estancia: "2024-01-30",
    estado_actual: "checkout",
  },
  {
    id_huesped: 4,
    nombres: "Ana Patricia",
    apellidos: "Silva Vega",
    id_tipo_documento: 2,
    numero_documento: "AB123456",
    reserva: {
      id_reserva: 4,
      fecha_checkin: "2024-02-20",
      fecha_checkout: "2024-02-25",
      estado: "pendiente",
      habitacion: {
        numero: "102",
        tipo: "Habitación Estándar",
      },
      total: 600.0,
    },
    cliente: {
      persona: {
        telefono: "+1 555-0123",
        correo: "ana.silva@email.com",
        fecha_nacimiento: "1988-05-12",
        direccion: {
          region: "Lima",
          provincia: "Lima",
          distrito: "Barranco",
          direccion_detallada: "Av. Grau 321",
        },
      },
    },
    historial_reservas: 2,
    ultima_estancia: "2023-12-15",
    estado_actual: "reserva_pendiente",
  },
  {
    id_huesped: 5,
    nombres: "Roberto",
    apellidos: "Sánchez Morales",
    id_tipo_documento: 1,
    numero_documento: "45678901",
    reserva: {
      id_reserva: 5,
      fecha_checkin: "2024-02-08",
      fecha_checkout: "2024-02-12",
      estado: "en_curso",
      habitacion: {
        numero: "202",
        tipo: "Suite Deluxe",
      },
      total: 1000.0,
    },
    cliente: {
      persona: {
        telefono: "+51 954321098",
        correo: "roberto.sanchez@email.com",
        fecha_nacimiento: "1975-09-30",
        direccion: {
          region: "Lima",
          provincia: "Lima",
          distrito: "La Molina",
          direccion_detallada: "Calle Los Olivos 654",
        },
      },
    },
    historial_reservas: 7,
    ultima_estancia: "2024-02-12",
    estado_actual: "checkin",
  },
];

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
  const statusConfig = {
    checkin: {
      class: "status-checkin",
      icon: "fas fa-user-check",
      text: "En Hotel",
    },
    checkout: {
      class: "status-checkout",
      icon: "fas fa-clock",
      text: "Check-out",
    },
    reserva_activa: {
      class: "status-reserva-activa",
      icon: "fas fa-calendar",
      text: "Reserva Activa",
    },
    reserva_pendiente: {
      class: "status-reserva-pendiente",
      icon: "fas fa-clock",
      text: "Pendiente",
    },
  };

  const config = statusConfig[status] || {
    class: "status-checkout",
    icon: "fas fa-question",
    text: status,
  };

  return `<span class="status-badge ${config.class}">
        <i class="${config.icon}"></i>
        ${config.text}
    </span>`;
}

function getDocumentTypeName(id) {
  const tipo = tiposDocumento.find((t) => t.id_tipo_documento === id);
  return tipo ? tipo.nombre : "N/A";
}

// Funciones de estadísticas
function updateStats() {
  const total = huespedes.length;
  const enHotel = huespedes.filter((g) => g.estado_actual === "checkin").length;
  const reservasActivas = huespedes.filter(
    (g) => g.estado_actual === "reserva_activa"
  ).length;
  const totalReservas = huespedes.reduce(
    (sum, g) => sum + g.historial_reservas,
    0
  );

  document.getElementById("total-huespedes").textContent = total;
  document.getElementById("en-hotel").textContent = enHotel;
  document.getElementById("reservas-activas").textContent = reservasActivas;
  document.getElementById("total-reservas").textContent = totalReservas;
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
    // Aquí iría la llamada al backend
    // const response = await fetch("api/huespedes/stats.php");
    // const { stats } = await response.json();
    // updateStats(stats);

    // Por ahora usamos datos estáticos
    updateStats();
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    showErrorToast("Error al cargar estadísticas");
  }
}

async function fetchHuespedesAll() {
  const table = document.querySelector(".table-wrapper");

  try {
    setTableLoading(table);

    // Aquí iría la llamada al backend
    // const response = await fetch("api/huespedes/getAll.php");
    // const { data } = await response.json();
    // updateTableHuespedes(data);

    // Por ahora usamos datos estáticos
    updateTableHuespedes(huespedes);
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
        <td>${getStatusBadge(guest.estado_actual)}</td>
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
          <button class="action-btn info" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn warning" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="action-btn danger" title="Eliminar">
            <i class="fas fa-trash"></i>
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
              huesped.estado_actual
            )}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total:</span>
            <span class="detail-value"><strong style="color: #d4af37;">$${huesped.reserva.total.toFixed(
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

function generarFormularioEditarHuesped(huesped) {
  const tipoOptions = tiposDocumento
    .map(
      (tipo) =>
        `<option value="${tipo.id_tipo_documento}" ${
          tipo.id_tipo_documento === huesped.id_tipo_documento ? "selected" : ""
        }>${tipo.nombre}</option>`
    )
    .join("");

  const estados = [
    "checkin",
    "checkout",
    "reserva_activa",
    "reserva_pendiente",
  ];
  const estadoOptions = estados
    .map(
      (est) =>
        `<option value="${est}" ${
          est === huesped.estado_actual ? "selected" : ""
        }>${est.replace("_", " ")}</option>`
    )
    .join("");

  return `
    <form id="form-editar-huesped" style="min-width:320px;max-width:500px;margin:auto;">
      <div class="form-row">
        <div class="form-group">
          <label for="edit-nombres"><strong>Nombres</strong></label>
          <input id="edit-nombres" class="form-input" type="text" value="${huesped.nombres}" style="width:100%;margin-bottom:1rem;" required />
        </div>
        <div class="form-group">
          <label for="edit-apellidos"><strong>Apellidos</strong></label>
          <input id="edit-apellidos" class="form-input" type="text" value="${huesped.apellidos}" style="width:100%;margin-bottom:1rem;" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="edit-tipo-documento"><strong>Tipo de Documento</strong></label>
          <select id="edit-tipo-documento" class="form-input" style="width:100%;margin-bottom:1rem;" required>
            ${tipoOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="edit-numero-documento"><strong>Número de Documento</strong></label>
          <input id="edit-numero-documento" class="form-input" type="text" value="${huesped.numero_documento}" style="width:100%;margin-bottom:1rem;" required />
        </div>
      </div>
      <div class="form-group">
        <label for="edit-estado"><strong>Estado Actual</strong></label>
        <select id="edit-estado" class="form-input" style="width:100%;margin-bottom:1rem;" required>
          ${estadoOptions}
        </select>
      </div>
    </form>
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
    const editarBtn = fila.querySelector(".action-btn.warning");
    const eliminarBtn = fila.querySelector(".action-btn.danger");

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

    editarBtn.addEventListener("click", () => {
      const idHuesped = fila.querySelector(".huesped-id")?.textContent;
      const huesped = huespedes.find(
        (g) => g.id_huesped === parseInt(idHuesped)
      );
      if (!huesped) return;

      modalTitulo.textContent = `Editar Huésped - ${huesped.nombres} ${huesped.apellidos}`;
      modalContenido.innerHTML = generarFormularioEditarHuesped(huesped);
      modal.showModal();
      modalActions.innerHTML = `
        <button type="button" class="btn-cancelar">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button type="submit" id="btn-guardar-editar" class="btn-confirmar">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      `;
      modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
      modalActions.querySelector("#btn-guardar-editar").onclick =
        async function (e) {
          e.preventDefault();
          const saveBtn = this;

          try {
            await withButtonLoader(
              saveBtn,
              async () => {
                const nombres = document.getElementById("edit-nombres").value;
                const apellidos =
                  document.getElementById("edit-apellidos").value;
                const id_tipo_documento = document.getElementById(
                  "edit-tipo-documento"
                ).value;
                const numero_documento = document.getElementById(
                  "edit-numero-documento"
                ).value;
                const estado_actual =
                  document.getElementById("edit-estado").value;

                const payload = {
                  id_huesped: huesped.id_huesped,
                  nombres,
                  apellidos,
                  id_tipo_documento,
                  numero_documento,
                  estado_actual,
                };

                // Aquí iría la llamada al backend
                console.log("Actualizando huésped:", payload);

                // Simular actualización
                const index = huespedes.findIndex(
                  (h) => h.id_huesped === huesped.id_huesped
                );
                if (index !== -1) {
                  huespedes[index] = { ...huespedes[index], ...payload };
                }

                await fetchHuespedesAll();
                await fetchHuespedesStats();
                modal.close();
                showSuccessToast("Huésped actualizado correctamente");

                return { success: true };
              },
              "Guardando..."
            );
          } catch (err) {
            showErrorToast("Error al actualizar: " + err.message);
          }
        };
    });

    eliminarBtn.addEventListener("click", () => {
      const idHuesped = fila.querySelector(".huesped-id")?.textContent;
      const nombre = fila.querySelector(".guest-name")?.textContent;
      const huesped = huespedes.find(
        (g) => g.id_huesped === parseInt(idHuesped)
      );

      modalTitulo.textContent = "Eliminar Huésped";
      modalContenido.innerHTML = `<p>¿Estás seguro de que deseas eliminar al huésped <strong>${nombre}</strong>?</p>`;
      modal.showModal();
      modalActions.innerHTML = `
        <button type="button" class="btn-cancelar">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button class="btn-confirmar-eliminar" data-id_huesped="${huesped?.id_huesped}">
          <i class="fas fa-trash"></i>
          Sí, eliminar
        </button>
      `;
      modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
      modalActions.querySelector(".btn-confirmar-eliminar").onclick =
        async () => {
          const deleteBtn = modalActions.querySelector(
            ".btn-confirmar-eliminar"
          );

          if (!huesped?.id_huesped) {
            showErrorToast("No se pudo obtener el ID del huésped");
            return;
          }

          try {
            await withButtonLoader(
              deleteBtn,
              async () => {
                // Aquí iría la llamada al backend
                console.log("Eliminando huésped:", huesped.id_huesped);

                // Simular eliminación
                const index = huespedes.findIndex(
                  (h) => h.id_huesped === huesped.id_huesped
                );
                if (index !== -1) {
                  huespedes.splice(index, 1);
                }

                await fetchHuespedesAll();
                await fetchHuespedesStats();
                modal.close();
                showSuccessToast("Huésped eliminado con éxito");

                return { success: true };
              },
              "Eliminando..."
            );
          } catch (error) {
            console.error("Error:", error);
            showErrorToast("Error al eliminar huésped: " + error.message);
          }
        };
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
