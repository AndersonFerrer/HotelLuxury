import {
  setTableLoading,
  setTableNormal,
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

// Función para obtener las estadísticas de las habitaciones
async function fetchRoomStats() {
  try {
    const response = await fetch("api/habitaciones/stats.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { stats } = await response.json();
    updateDashboardStats(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    showErrorToast("Error al cargar estadísticas");
  }
}

async function fetchRoomsAll() {
  const table = document.querySelector(".table-container");

  try {
    setTableLoading(table);

    const response = await fetch("api/habitaciones/getAll.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    updateTableRooms(data);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    showErrorToast("Error al cargar habitaciones");
  } finally {
    setTableNormal(table);
  }
}

function updateTableRooms(data) {
  const tbody = document.getElementById("habitaciones-tbody");
  if (!tbody) return; // Si no existe la tabla, salir

  if (data.length === 0) {
    return (tbody.innerText = "No hay habitaciones");
  }
  tbody.innerHTML = ""; // Limpiar

  data.forEach((habitacion) => {
    const getStatus = (estado) => {
      switch (estado) {
        case "Disponible":
          return "success";
        case "Ocupada":
          return "danger";
        case "Mantenimiento":
          return "warning";
        default:
          return "info";
      }
    };
    const fila = `<tr class="habitacion-fila">
          <td class="habitacion-id">${habitacion.id_habitacion}</td>
          <td class="habitacion-numero">#${habitacion.numero}</td>
          <td>
            <div>
              <strong class="habitacion-tipo">${
                habitacion.tipo_habitacion
              }</strong>
              <p class="caracteristicas">${
                habitacion.cantidad_caracteristicas
              } características</p>
            </div>
          </td>
          <td><span class="status-badge habitacion-estado ${getStatus(
            habitacion.estado
          )}">${habitacion.estado}</span></td>
          <td class="habitacion-precio">S/. ${habitacion.precio_noche}</td>
          <td>-</td>
          <td class="acciones">
            <button class="action-btn info" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn warning" title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button class="action-btn danger" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
    tbody.insertAdjacentHTML("beforeend", fila);
  });
}

let tipos_habitaciones = [];

async function fetchTiposHabitaciones() {
  try {
    const response = await fetch(
      "api/tipoHabitaciones/getTipoHabitaciones.php"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    tipos_habitaciones = data;
  } catch (error) {
    console.error("Error al obtener tipos de habitaciones:", error);
  }
}

// Función para actualizar las estadísticas en el dashboard
function updateDashboardStats(data) {
  console.log(data, "data");
  // Verificar que los elementos existen antes de intentar acceder a ellos
  const totalRooms = document.getElementById("total-rooms");
  const availableRooms = document.getElementById("available-rooms");
  const occupiedRooms = document.getElementById("occupied-rooms");
  const maintenanceRooms = document.getElementById("maintenance-rooms");
  const occupancyRate = document.getElementById("occupancy-rate");

  if (totalRooms) totalRooms.textContent = data.total || 0;
  if (availableRooms) availableRooms.textContent = data.disponibles || 0;
  if (occupiedRooms) occupiedRooms.textContent = data.ocupadas || 0;
  if (maintenanceRooms) maintenanceRooms.textContent = data.mantenimiento || 0;
  if (occupancyRate)
    occupancyRate.textContent = `${data.porcentaje_ocupacion || 0}%`;
}

await fetchRoomStats();
await fetchRoomsAll();
await fetchTiposHabitaciones();

const modal = document.getElementById("modal-habitacion");
const modalContenido = document.getElementById("modal-contenido");
const modalTitulo = document.getElementById("modal-titulo");
const modalActions = document.getElementById("modal-actions");
// Al recorrer y renderizar las filas, también agrega los listeners
document.querySelectorAll(".habitacion-fila").forEach((fila) => {
  const verBtn = fila.querySelector(".action-btn.info");
  const editarBtn = fila.querySelector(".action-btn.warning");
  const eliminarBtn = fila.querySelector(".action-btn.danger");

  verBtn.addEventListener("click", async () => {
    const idHabitacion = fila.querySelector(".habitacion-id")?.textContent;
    modalTitulo.textContent = "Detalles de Habitación";
    modalContenido.innerHTML =
      '<div style="text-align:center;">Cargando...</div>';
    modal.showModal();
    modalActions.innerHTML = "";
    try {
      const response = await fetch(
        `api/habitaciones/detalle.php?id=${idHabitacion}`
      );
      const { data, success } = await response.json();
      if (!success) throw new Error("No se pudo obtener el detalle");
      modalContenido.innerHTML = generarModalVisualHabitacion(data);
      // Botón Cancelar
      modalActions.innerHTML = `<button type="button" class="btn-cancelar">Cancelar</button>`;
      modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
    } catch (e) {
      modalContenido.innerHTML = `<div style='color:red;'>Error al cargar detalles</div>`;
    }
  });

  editarBtn.addEventListener("click", async () => {
    const idHabitacion = fila.querySelector(".habitacion-id")?.textContent;
    modalTitulo.textContent = `Editar Habitación #${idHabitacion}`;
    modalContenido.innerHTML =
      '<div style="text-align:center;">Cargando...</div>';
    modal.showModal();
    modalActions.innerHTML = "";
    try {
      const response = await fetch(
        `api/habitaciones/detalle.php?id=${idHabitacion}`
      );
      const { data, success } = await response.json();
      if (!success) throw new Error("No se pudo obtener el detalle");
      modalContenido.innerHTML = generarFormularioEditarVisual(data);
      // Botones Cancelar y Guardar Cambios
      modalActions.innerHTML = `
        <button type="button" class="btn-cancelar">Cancelar</button>
        <button type="submit" id="btn-guardar-editar">Guardar Cambios</button>
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
                const numero = document.getElementById("edit-numero").value;
                const estado = document.getElementById("edit-estado").value;
                const id_tipo_habitacion =
                  document.getElementById("edit-tipo").value;
                const payload = {
                  id_habitacion: idHabitacion,
                  numero,
                  estado,
                  id_tipo_habitacion,
                };

                const res = await fetch("api/habitaciones/update.php", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const result = await res.json();
                if (!result.success) throw new Error(result.message);

                await fetchRoomsAll();
                await fetchRoomStats();
                modal.close();
                showSuccessToast("Habitación actualizada correctamente");

                return result;
              },
              "Guardando..."
            );
          } catch (err) {
            showErrorToast("Error al actualizar: " + err.message);
          }
        };
    } catch (e) {
      modalContenido.innerHTML = `<div style='color:red;'>Error al cargar detalles</div>`;
    }
  });

  eliminarBtn.addEventListener("click", () => {
    const idHabitacion = fila.querySelector(".habitacion-id")?.textContent;
    const numero = fila.querySelector(".habitacion-numero")?.textContent;
    modalTitulo.textContent = "Eliminar Habitación";
    modalContenido.innerHTML = `<p>¿Estás seguro de que deseas eliminar la habitación <strong>${numero}</strong>?</p>`;
    modal.showModal();
    modalActions.innerHTML = `
      <button type="button" class="btn-cancelar">Cancelar</button>
      <button class="btn-confirmar-eliminar" data-id_habitacion="${idHabitacion}">Sí, eliminar</button>
    `;
    modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
    modalActions.querySelector(".btn-confirmar-eliminar").onclick =
      async () => {
        const deleteBtn = modalActions.querySelector(".btn-confirmar-eliminar");

        if (!idHabitacion) {
          showErrorToast("No se pudo obtener el ID de la habitación");
          return;
        }

        try {
          await withButtonLoader(
            deleteBtn,
            async () => {
              const response = await fetch(
                `api/habitaciones/delete.php?id_habitacion=${idHabitacion}`,
                { method: "DELETE" }
              );
              const data = await response.json();
              if (!response.ok || !data.success) {
                throw new Error(data.message || "Error al eliminar habitación");
              }

              await fetchRoomsAll();
              await fetchRoomStats();
              modal.close();
              showSuccessToast("Habitación eliminada con éxito");

              return data;
            },
            "Eliminando..."
          );
        } catch (error) {
          console.error("Error:", error);
          showErrorToast("Error al eliminar habitación: " + error.message);
        }
      };
  });
});

function generarModalVisualHabitacion(data) {
  // Estado badge
  let estadoBadge = `<span class="status-badge ${
    data.estado === "Disponible"
      ? "success"
      : data.estado === "Ocupada"
      ? "danger"
      : "warning"
  }">${data.estado}</span>`;
  // Imágenes
  let imagenesHTML = "";
  if (data.imagenes && data.imagenes.length > 0) {
    imagenesHTML =
      `<div style='display:flex;gap:8px;justify-content:center;margin-bottom:1rem;'>` +
      data.imagenes
        .map(
          (img) =>
            `<img src='${img}' alt='img' style='width:90px;height:60px;object-fit:cover;border-radius:6px;'>`
        )
        .join("") +
      `</div>`;
  }
  // Características
  let caracs =
    data.caracteristicas && data.caracteristicas.length
      ? data.caracteristicas
          .map(
            (c) =>
              `<li><i class='fas fa-check-circle' style='color:#27ae60;'></i> ${c}</li>`
          )
          .join("")
      : "<li>No especificadas</li>";
  // Última limpieza
  let limpieza = data.ultima_limpieza
    ? new Date(data.ultima_limpieza).toLocaleString("es-PE")
    : "No registrada";
  return `
    <div style="padding:0.5rem 0;">
      <h4 style="margin-bottom:0.5rem;">Información General</h4>
      ${imagenesHTML}
      <div style="background:#f8f9fa;padding:1rem;border-radius:8px;margin-bottom:1rem;">
        <strong>Número:</strong> ${data.numero}<br>
        <strong>Tipo:</strong> ${data.tipo_nombre}<br>
        <strong>Estado:</strong> ${estadoBadge}<br>
        <strong>Precio por noche:</strong> <span style='color:#d4af37;font-weight:bold;'>S/. ${
          data.precio_noche
        }</span><br>
        <strong>Última limpieza:</strong> ${limpieza}
      </div>
      <h4>Descripción del Tipo</h4>
      <div style="background:#f8f9fa;padding:0.75rem;border-radius:8px;margin-bottom:1rem;">${
        data.tipo_descripcion || ""
      }</div>
      <h4>Características</h4>
      <ul style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1.5rem;list-style:none;padding:0;">${caracs}</ul>
    </div>
  `;
}

function generarFormularioEditarVisual(data) {
  console.log(data);
  // Estado
  const estados = ["Disponible", "Ocupado", "Mantenimiento"];
  // Tipos de habitación
  const tipoOptions = tipos_habitaciones
    .map(
      (tipo) =>
        `<option value="${tipo.id_tipo_habitacion}" ${
          tipo.nombre === data.tipo_nombre ? "selected" : ""
        }>${tipo.nombre} - S/. ${tipo.precio_noche}/noche</option>`
    )
    .join("");
  return `
    <form id="form-editar-habitacion" style="min-width:320px;max-width:500px;margin:auto;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
        <div>
          <label for="edit-estado"><strong>Estado</strong></label><br>
          <select id="edit-estado" class="form-input" style="width:100%;margin-bottom:1rem;">
            ${estados
              .map(
                (est) =>
                  `<option value="${est}" ${
                    est === data.estado ? "selected" : ""
                  }>${est}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label for="edit-tipo"><strong>Tipo de Habitación</strong></label><br>
          <select id="edit-tipo" class="form-input" style="width:100%;margin-bottom:1rem;">
            ${tipoOptions}
          </select>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <label for="edit-numero"><strong>Número</strong></label><br>
        <input id="edit-numero" class="form-input" type="text" value="${
          data.numero
        }" style="width:100%;margin-bottom:1rem;" />
      </div>
    </form>
  `;
}

function generarHTMLEliminar(fila) {
  const id_habitacion = fila.querySelector(".habitacion-id")?.textContent;
  const numero = fila.querySelector(".habitacion-numero")?.textContent;
  const btnAgregar = document.querySelector(".btn-confirmar-agregar");
  const btnEditar = document.querySelector(".btn-confirmar-editar");
  const btnEliminar = document.querySelector(".btn-confirmar-eliminar");
  if (btnAgregar || btnEditar) {
    btnAgregar?.remove();
    btnEditar?.remove();
  }
  if (!btnEliminar) {
    modalActions.insertAdjacentHTML(
      "beforeend",
      `
    <button class="btn-confirmar-eliminar" data-id_habitacion="${id_habitacion}">Sí, eliminar</button>
  `
    );
  }
  return `<p>¿Estás seguro de que deseas eliminar la habitación <strong>${numero}</strong>?</p>
          `;
}

const btnAgregar = document.querySelector(".btn");
const btnCerrar = document.querySelector(".btn-cancelar");

btnCerrar.addEventListener("click", () => {
  modal.close();
});

btnAgregar.addEventListener("click", () => {
  modalTitulo.textContent = "Agregar Habitación";
  modalContenido.innerHTML = generarFormularioAgregar();
  modal.showModal();
  modalActions.innerHTML = `
    <button type="button" class="btn-cancelar">Cancelar</button>
    <button type="submit" class="btn-confirmar-agregar">Agregar</button>
  `;
  modalActions.querySelector(".btn-cancelar").onclick = () => modal.close();
  modalActions.querySelector(".btn-confirmar-agregar").onclick = async (e) => {
    e.preventDefault();
    const numero = document.getElementById("numero-habitacion").value;
    const tipo = document.getElementById("tipo-habitacion").value;
    if (!numero || !tipo) {
      alert("Por favor, completa todos los campos");
      return;
    }
    try {
      const response = await fetch("api/habitaciones/insert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, tipo }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al agregar habitación");
      }
      await fetchRoomsAll();
      await fetchRoomStats();
      modal.close();
      alert("Habitación agregada con éxito");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al agregar habitación: " + error.message);
    }
  };
});

function generarFormularioAgregar() {
  const tipoOptions = tipos_habitaciones
    .map(
      (tipo) =>
        `<option value="${tipo.id_tipo_habitacion}">${tipo.nombre} - S/. ${tipo.precio_noche}/noche</option>`
    )
    .join("");
  return `
    <form id="form-agregar-habitacion" style="min-width:320px;max-width:500px;margin:auto;">
      <div style="margin-bottom:1rem;">
        <label for="numero-habitacion"><strong>Número</strong></label><br>
        <input id="numero-habitacion" class="form-input" type="text" style="width:100%;margin-bottom:1rem;" />
      </div>
      <div style="margin-bottom:1rem;">
        <label for="tipo-habitacion"><strong>Tipo de Habitación</strong></label><br>
        <select id="tipo-habitacion" class="form-input" style="width:100%;margin-bottom:1rem;">
          ${tipoOptions}
        </select>
      </div>
    </form>
  `;
}

window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "habitaciones") {
    await fetchRoomsAll();
    await fetchRoomStats();
  }
});
