// Variables globales
let reservasData = [];
let reservaSeleccionada = null;

// Función para obtener estadísticas de reservas
async function fetchReservasStats() {
  try {
    const response = await fetch("api/reservas/getAll.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(response);
    const { data } = await response.json();
    updateStatsUI(data);
    reservasData = data.reservas;
    updateTableUI(data.reservas);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  }
}

// Función para actualizar las estadísticas en la UI
function updateStatsUI(stats) {
  console.log(stats);
  document.getElementById("total-reservas").textContent =
    stats.total_reservas || 0;
  document.getElementById("reservas-confirmadas").textContent =
    stats.total_confirmadas || 0;
  document.getElementById("reservas-pendientes").textContent =
    stats.total_pendientes || 0;
  document.getElementById("ingresos-totales-reservas").textContent = `S/. ${
    stats.total_ingresos || 0
  }`;
}

// Función para filtrar reservas por estado
function filtrarReservas() {
  const filtro = document.getElementById("filter-estado").value;
  let reservasFiltradas = reservasData;

  if (filtro) {
    reservasFiltradas = reservasData.filter(
      (reserva) => reserva.estado === filtro
    );
  }

  updateTableUI(reservasFiltradas);
}

// Función para ver detalles de una reserva
async function verDetallesReserva(idReserva) {
  const reserva = reservasData.find((r) => r.id == idReserva);
  if (!reserva) return;

  const modal = document.getElementById("modal-reservas");
  const modalTitulo = document.getElementById("modal-titulo");
  const modalContenido = document.getElementById("modal-contenido");
  const modalActions = document.getElementById("modal-actions");

  modalTitulo.textContent = `Detalles de Reserva #${idReserva}`;
  modalContenido.innerHTML = generarDetallesReserva(reserva);
  modalActions.innerHTML = `<button type="button" class="btn-cancelar">Cerrar</button>`;

  modalActions.querySelector(".btn-cancelar").onclick = () => {
    modal.close();
    document.body.classList.remove("body-modal-open");
  };
  modal.showModal();
  document.body.classList.add("body-modal-open");
}

// Función para generar HTML de detalles de reserva
function generarDetallesReserva(reserva) {
  return `
    <div style="padding: 1rem 0;">
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <h4 style="margin-bottom: 0.5rem;">Información de la Reserva</h4>
        <p><strong>ID:</strong> ${reserva.id}</p>
        <p><strong>Huésped:</strong> ${reserva.huesped}</p>
        <p><strong>Habitación:</strong> ${reserva.habitacion}</p>
        <p><strong>Estado:</strong> <span class="status-badge ${getStatusClass(
          reserva.estado
        )}">${reserva.estado}</span></p>
        <p><strong>Check-in:</strong> ${reserva.checkin}</p>
        <p><strong>Check-out:</strong> ${reserva.checkout}</p>
        <p><strong>Total:</strong> S/. ${reserva.total}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
        <h4 style="margin-bottom: 0.5rem;">Acciones Disponibles</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${generarBotonesAccion(reserva.estado, reserva.id)}
        </div>
      </div>
    </div>
  `;
}

// Función para generar botones de acción según el estado
function generarBotonesAccion(estado, id) {
  switch (estado) {
    case "Pendiente":
      return `
        <button class="btn btn-success" onclick="confirmarReserva(${id})">
          <i class="fas fa-check"></i> Confirmar
        </button>
        <button class="btn btn-danger" onclick="rechazarReserva(${id})">
          <i class="fas fa-times"></i> Rechazar
        </button>`;
    case "Confirmada":
      return `
        <button class="btn btn-info" onclick="activarReserva(${id})">
          <i class="fas fa-sign-in-alt"></i> Check-in
        </button>
        <button class="btn btn-danger" onclick="cancelarReserva(${id})">
          <i class="fas fa-ban"></i> Cancelar
        </button>`;
    case "Activa":
      return `
        <button class="btn btn-success" onclick="completarReserva(${id})">
          <i class="fas fa-sign-out-alt"></i> Check-out
        </button>`;
    default:
      return `<span class="text-muted">No hay acciones disponibles</span>`;
  }
}

// Función para obtener clase CSS del estado
function getStatusClass(estado) {
  switch (estado) {
    case "Pendiente":
      return "warning";
    case "Confirmada":
      return "success";
    case "Activa":
      return "info";
    case "Completada":
      return "success";
    case "Cancelada":
      return "danger";
    default:
      return "info";
  }
}

// Función para mostrar modal de confirmación
function mostrarModalConfirmacion(titulo, mensaje, accion) {
  const modal = document.getElementById("modal-confirmacion");
  const modalTitulo = document.getElementById("modal-confirmacion-titulo");
  const modalContenido = document.getElementById(
    "modal-confirmacion-contenido"
  );
  const btnConfirmar = document.getElementById("btn-confirmar-accion");

  modalTitulo.textContent = titulo;
  modalContenido.innerHTML = `<p>${mensaje}</p>`;

  btnConfirmar.onclick = accion;
  modal.querySelector(".btn-cancelar").onclick = () => {
    modal.close();
    document.body.classList.remove("body-modal-open");
  };

  modal.showModal();
  document.body.classList.add("body-modal-open");
}

// Funciones para gestionar estados de reservas
async function confirmarReserva(idReserva) {
  mostrarModalConfirmacion(
    "Confirmar Reserva",
    `¿Estás seguro de que deseas confirmar la reserva #${idReserva}?`,
    async () => {
      try {
        const response = await fetch("api/reservas/confirmar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_reserva: idReserva }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Reserva confirmada exitosamente");
          document.getElementById("modal-confirmacion").close();
          await fetchReservasStats();
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al confirmar la reserva");
      }
    }
  );
}

async function rechazarReserva(idReserva) {
  mostrarModalConfirmacion(
    "Rechazar Reserva",
    `¿Estás seguro de que deseas rechazar la reserva #${idReserva}?`,
    async () => {
      try {
        const response = await fetch("api/reservas/rechazar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_reserva: idReserva }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Reserva rechazada exitosamente");
          document.getElementById("modal-confirmacion").close();
          await fetchReservasStats();
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al rechazar la reserva");
      }
    }
  );
}

async function cancelarReserva(idReserva) {
  mostrarModalConfirmacion(
    "Cancelar Reserva",
    `¿Estás seguro de que deseas cancelar la reserva #${idReserva}?`,
    async () => {
      try {
        const response = await fetch("api/reservas/cancelar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_reserva: idReserva }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Reserva cancelada exitosamente");
          document.getElementById("modal-confirmacion").close();
          await fetchReservasStats();
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al cancelar la reserva");
      }
    }
  );
}

async function activarReserva(idReserva) {
  mostrarModalConfirmacion(
    "Activar Reserva (Check-in)",
    `¿Confirmar el check-in para la reserva #${idReserva}?`,
    async () => {
      try {
        const response = await fetch("api/reservas/activar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_reserva: idReserva }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Check-in realizado exitosamente");
          document.getElementById("modal-confirmacion").close();
          await fetchReservasStats();
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al realizar el check-in");
      }
    }
  );
}

async function completarReserva(idReserva) {
  mostrarModalConfirmacion(
    "Completar Reserva (Check-out)",
    `¿Confirmar el check-out para la reserva #${idReserva}?`,
    async () => {
      try {
        const response = await fetch("api/reservas/completar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_reserva: idReserva }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Check-out realizado exitosamente");
          document.getElementById("modal-confirmacion").close();
          await fetchReservasStats();
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al realizar el check-out");
      }
    }
  );
}

// Función para actualizar la tabla de reservas
function updateTableUI(data) {
  const tbody = document.getElementById("table-reservas");
  if (data.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='8' style='text-align:center;'>No hay reservas</td></tr>";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((reserva) => {
    const getStatus = (estado) => {
      switch (estado) {
        case "Pendiente":
          return "warning";
        case "Confirmada":
          return "success";
        case "Activa":
          return "info";
        case "Completada":
          return "success";
        case "Cancelada":
          return "danger";
        default:
          return "info";
      }
    };

    const getAcciones = (estado, id) => {
      let acciones = `<button class="action-btn info" title="Ver detalles" onclick="verDetallesReserva(${id})">
        <i class="fas fa-eye"></i>
      </button>`;

      switch (estado) {
        case "Pendiente":
          acciones += `
            <button class="action-btn success" title="Confirmar" onclick="confirmarReserva(${id})">
              <i class="fas fa-check"></i>
            </button>
            <button class="action-btn danger" title="Rechazar" onclick="rechazarReserva(${id})">
              <i class="fas fa-times"></i>
            </button>`;
          break;
        case "Confirmada":
          acciones += `
            <button class="action-btn info" title="Activar (Check-in)" onclick="activarReserva(${id})">
              <i class="fas fa-sign-in-alt"></i>
            </button>
            <button class="action-btn danger" title="Cancelar" onclick="cancelarReserva(${id})">
              <i class="fas fa-ban"></i>
            </button>`;
          break;
        case "Activa":
          acciones += `
            <button class="action-btn success" title="Completar (Check-out)" onclick="completarReserva(${id})">
              <i class="fas fa-sign-out-alt"></i>
            </button>`;
          break;
        case "Completada":
          acciones += `<span class="text-muted">Finalizada</span>`;
          break;
        case "Cancelada":
          acciones += `<span class="text-muted">Cancelada</span>`;
          break;
      }

      return acciones;
    };

    const fila = `
      <tr class="reserva-fila" data-id="${reserva.ID}">
        <td>${reserva.id}</td>
        <td>${reserva.huesped}</td>
        <td>${reserva.habitacion}</td>
        <td>${reserva.checkin}</td>
        <td>${reserva.checkout}</td>
        <td><span class="status-badge ${getStatus(reserva.estado)}">${
      reserva.estado
    }</span></td>
        <td>S/. ${reserva.total}</td>
        <td class="acciones">
          ${getAcciones(reserva.estado, reserva.id)}
        </td>
      </tr>`;
    tbody.insertAdjacentHTML("beforeend", fila);
  });
}

await fetchReservasStats();

// Filtro por estado
document
  .getElementById("filter-estado")
  .addEventListener("change", filtrarReservas);

// Cerrar modales
document.querySelectorAll(".btn-cancelar").forEach((btn) => {
  btn.addEventListener("click", function () {
    this.closest("dialog").close();
  });
});

// Actualizar cuando cambie la ruta
window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "reservas") {
    await fetchReservasStats();
  }
});

window.verDetallesReserva = verDetallesReserva;
window.confirmarReserva = confirmarReserva;
window.rechazarReserva = rechazarReserva;
window.cancelarReserva = cancelarReserva;
window.activarReserva = activarReserva;
window.completarReserva = completarReserva;
