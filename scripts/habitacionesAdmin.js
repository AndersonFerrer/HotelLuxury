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
  const baseRow = document.querySelector(".habitacion-fila");

  tbody.innerHTML = ""; // Limpiar

  data.forEach((habitacion) => {
    const clone = baseRow.cloneNode(true);

    clone.querySelector(".habitacion-numero").textContent = habitacion.numero;
    clone.querySelector(".tipo-habitacion strong").textContent =
      habitacion.tipo_habitacion;
    clone.querySelector(
      ".caracteristicas"
    ).textContent = `${habitacion.cantidad_caracteristicas} características`;

    const estadoSpan = clone.querySelector(".estado");
    estadoSpan.textContent = habitacion.estado;
    estadoSpan.className = "estado estado-" + habitacion.estado.toLowerCase();

    clone.children[3].textContent = `$${habitacion.precio_noche}`;
    clone.querySelector(".huesped").innerHTML = habitacion.huesped
      ? `${habitacion.huesped.nombre}<br><small>Checkout: ${habitacion.huesped.checkout}</small>`
      : "-";

    tbody.appendChild(clone);
  });
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
fetchRoomStats();
fetchRoomsAll();

const modal = document.getElementById("modal-habitacion");
const modalContenido = document.getElementById("modal-contenido");
const modalTitulo = document.getElementById("modal-titulo");

// Al recorrer y renderizar las filas, también agrega los listeners
document.querySelectorAll(".habitacion-fila").forEach((fila) => {
  const verBtn = fila.querySelector(".accion-ver");
  const editarBtn = fila.querySelector(".accion-editar");
  const eliminarBtn = fila.querySelector(".accion-eliminar");

  verBtn.addEventListener("click", () => {
    console.log("gaaaa");
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
  });
});

function generarHTMLVer(fila) {
  const numero = fila.querySelector(".habitacion-numero")?.textContent;
  const tipo = fila.querySelector(".tipo-habitacion strong")?.textContent;
  const estado = fila.querySelector(".estado")?.textContent;
  const precio = fila.children[3]?.textContent;
  const huesped = fila.querySelector(".huesped")?.innerHTML;

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

  return `
    <label>Número: <input type="text" value="${numero.replace(
      "#",
      ""
    )}" /></label><br>
    <label>Tipo: <input type="text" value="${tipo}" /></label><br>
    <button type="submit">Guardar Cambios</button>
  `;
}

function generarHTMLEliminar(fila) {
  const numero = fila.querySelector(".habitacion-numero")?.textContent;
  return `<p>¿Estás seguro de que deseas eliminar la habitación <strong>${numero}</strong>?</p>
          <button class="btn-confirmar-eliminar">Sí, eliminar</button>`;
}
