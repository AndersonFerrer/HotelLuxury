// Función para obtener las estadísticas de las habitaciones
async function fetchRoomStats() {
  try {
    const response = await fetch("api/habitaciones/stats.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    updateDashboardStats(data);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  }
}

async function fetchRoomsAll() {
  try {
    const response = await fetch("api/habitaciones/getAll.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    updateTableRooms(data);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
  }
}

function updateTableRooms(data) {
  const tbody = document.getElementById("habitaciones-tbody");
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
    const response = await fetch("api/habitaciones/getTipoHabitaciones.php");
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
  document.getElementById("total-rooms").textContent = data.total || 0;
  document.getElementById("available-rooms").textContent =
    data.disponibles || 0;
  document.getElementById("occupied-rooms").textContent = data.ocupadas || 0;
  document.getElementById("maintenance-rooms").textContent =
    data.mantenimiento || 0;
  document.getElementById("occupancy-rate").textContent = `${
    data.porcentaje_ocupacion || 0
  }%`;
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

  verBtn.addEventListener("click", () => {
    modalTitulo.textContent = "Ver Habitación";
    modalContenido.innerHTML = generarHTMLVer(fila);
    modal.showModal();
  });

  editarBtn.addEventListener("click", () => {
    modalTitulo.textContent = "Editar Habitación";
    modalContenido.innerHTML = generarFormularioEditar(fila);
    modal.showModal();
  });

  eliminarBtn.addEventListener("click", () => {
    modalTitulo.textContent = "Eliminar Habitación";
    modalContenido.innerHTML = generarHTMLEliminar(fila);
    modal.showModal();
    // Agregar el event listener al botón recién creado
    modalContenido
      .querySelector(".btn-confirmar-eliminar")
      .addEventListener("click", async () => {
        const id_habitacion = modalContenido.querySelector(
          ".btn-confirmar-eliminar"
        ).dataset.id_habitacion;

        if (!id_habitacion) {
          alert("No se pudo obtener el ID de la habitación");
          return;
        }

        try {
          const response = await fetch(
            `api/habitaciones/delete.php?id_habitacion=${id_habitacion}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Error al eliminar habitación");
          }
          await fetchRoomsAll();
          await fetchRoomStats();
          modal.close();
          alert("Habitación eliminada con éxito"); // Feedback al usuario
        } catch (error) {
          console.error("Error:", error);
          alert("Error al eliminar habitación: " + error.message);
        }
      });
  });
});

function generarHTMLVer(fila) {
  const numero = fila.querySelector(".habitacion-numero")?.textContent;
  const tipo = fila.querySelector(".habitacion-tipo")?.textContent;
  const estado = fila.querySelector(".habitacion-estado")?.textContent;
  const precio = fila.querySelector(".habitacion-precio")?.textContent;
  const huesped =
    fila.querySelector(".habitacion-huesped")?.innerHTML || "No tiene";

  const btnAgregar = document.querySelector(".btn-confirmar-agregar");
  const btnEditar = document.querySelector(".btn-confirmar-editar");
  const btnEliminar = document.querySelector(".btn-confirmar-eliminar");
  if (btnAgregar || btnEliminar || btnEditar) {
    btnAgregar?.remove();
    btnEliminar?.remove();
    btnEditar?.remove();
  }
  return `
    <p><strong>Número:</strong> ${numero}</p>
    <p><strong>Tipo:</strong> ${tipo}</p>
    <p><strong>Estado:</strong> ${estado}</p>
    <p><strong>Precio:</strong> ${precio}</p>
    <p><strong>Huésped:</strong> ${huesped}</p>
  `;
}

function generarFormularioEditar(fila) {
  const numero = fila.querySelector(".habitacion-numero")?.textContent;
  const tipo = fila.querySelector(".tipo-habitacion strong")?.textContent;
  const btnAgregar = document.querySelector(".btn-confirmar-agregar");
  const btnEditar = document.querySelector(".btn-confirmar-editar");
  const btnEliminar = document.querySelector(".btn-confirmar-eliminar");
  if (btnAgregar || btnEliminar) {
    btnAgregar?.remove();
    btnEliminar?.remove();
  }
  if (!btnEditar) {
    modalActions.insertAdjacentHTML(
      "beforeend",
      `
    <button type="submit" class="btn-confirmar-editar">Editar</button>
  `
    );
  }

  return `
    <label>Número: <input type="text" value="${numero.replace(
      "#",
      ""
    )}" /></label><br>
    <label>Tipo: <input type="text" value="${tipo}" /></label><br>
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
  const btnAgregar = document.querySelector(".btn-confirmar-agregar");
  const btnEditar = document.querySelector(".btn-confirmar-editar");
  if (btnEditar) {
    btnEditar.remove();
  }
  if (!btnAgregar) {
    modalActions.insertAdjacentHTML(
      "beforeend",
      `
    <button type="submit" class="btn-confirmar-agregar">Agregar</button>
  `
    );
  }

  modal.showModal();
});

function generarFormularioAgregar() {
  return `
    <label>Número: <input name="numero" id="numero-habitacion" type="text" /></label><br>
    <label>Tipo: <select name="tipo" id="tipo-habitacion">
      ${tipos_habitaciones
        .map(
          (tipo) =>
            `<option value="${tipo.id_tipo_habitacion}">${tipo.nombre}</option>`
        )
        .join("")}
    </select></label><br>
  `;
}

const formularioAgregar = document.querySelector("form");

formularioAgregar.addEventListener("submit", async (e) => {
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numero, tipo }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error al agregar habitación");
    }

    await fetchRoomsAll();
    await fetchRoomStats();
    modal.close();
    alert("Habitación agregada con éxito"); // Feedback al usuario
  } catch (error) {
    console.error("Error:", error);
    alert("Error al agregar habitación: " + error.message);
  }
});

window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "habitaciones") {
    await fetchRoomsAll();
    await fetchRoomStats();
  }
});
