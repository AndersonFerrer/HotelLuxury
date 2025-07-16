// Importar utilidades de loader
import {
  withButtonLoader,
  withLoadingModal,
  showSuccessToast,
  showErrorToast,
  setTableLoading,
  setTableNormal,
} from "./loaderUtils.js";

// Variables globales
let tiposHabitacion = [];
let caracteristicas = [];
let tipoSeleccionado = null;
let caracteristicaSeleccionada = null;
let modoEdicion = false;

// Elementos del DOM
const elementos = {
  // Stats
  totalTipos: document.getElementById("total-tipos"),
  totalCaracteristicas: document.getElementById("total-caracteristicas"),
  precioPromedio: document.getElementById("precio-promedio"),
  totalHabitaciones: document.getElementById("total-habitaciones"),

  // Tabs
  tabBtns: document.querySelectorAll(".tab-btn"),
  tabContents: document.querySelectorAll(".tab-content"),

  // Tablas
  tableTipos: document.getElementById("table-tipos"),
  tableCaracteristicas: document.getElementById("table-caracteristicas"),

  // Búsquedas
  searchTipos: document.getElementById("search-tipos"),
  searchCaracteristicas: document.getElementById("search-caracteristicas"),

  // Botones
  btnNuevoTipo: document.getElementById("btn-nuevo-tipo"),
  btnNuevaCaracteristica: document.getElementById("btn-nueva-caracteristica"),

  // Modales
  modalTipo: document.getElementById("modal-tipo"),
  modalCaracteristica: document.getElementById("modal-caracteristica"),
  modalConfirmar: document.getElementById("modal-confirmar"),

  // Formularios
  formTipo: document.getElementById("form-tipo"),
  formCaracteristica: document.getElementById("form-caracteristica"),

  // Campos del formulario tipo
  nombreTipo: document.getElementById("nombre-tipo"),
  precioTipo: document.getElementById("precio-tipo"),
  descripcionTipo: document.getElementById("descripcion-tipo"),
  caracteristicasTipo: document.getElementById("caracteristicas-tipo"),

  // Campos del formulario característica
  nombreCaracteristica: document.getElementById("nombre-caracteristica"),
  descripcionCaracteristica: document.getElementById(
    "descripcion-caracteristica"
  ),

  // Modal confirmar
  modalConfirmarTitulo: document.getElementById("modal-confirmar-titulo"),
  modalConfirmarMensaje: document.getElementById("modal-confirmar-mensaje"),
  confirmarEliminar: document.getElementById("confirmar-eliminar"),
  cancelarEliminar: document.getElementById("cancelar-eliminar"),
};

async function inicializarTiposCaracteristicas() {
  console.log("configurando eventos", elementos);
  try {
    // Cargar datos iniciales
    await Promise.all([
      cargarTiposHabitacion(),
      cargarCaracteristicas(),
      cargarEstadisticas(),
    ]);

    // Configurar eventos
    configurarEventos();
  } catch (error) {
    console.error("Error al inicializar tipos y características:", error);
    showErrorToast("Error al cargar los datos");
  }
}

// Configuración de eventos
function configurarEventos() {
  // Eventos de tabs
  elementos.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => cambiarTab(btn.dataset.tab));
  });

  // Eventos de búsqueda
  elementos.searchTipos.addEventListener("input", filtrarTipos);
  elementos.searchCaracteristicas.addEventListener(
    "input",
    filtrarCaracteristicas
  );

  // Eventos de botones
  elementos.btnNuevoTipo.addEventListener("click", () => abrirModalTipo());
  elementos.btnNuevaCaracteristica.addEventListener("click", () =>
    abrirModalCaracteristica()
  );

  // Eventos de formularios
  elementos.formTipo.addEventListener("submit", manejarSubmitTipo);
  elementos.formCaracteristica.addEventListener(
    "submit",
    manejarSubmitCaracteristica
  );

  // Eventos de cierre de modales
  document
    .getElementById("cerrar-modal-tipo")
    .addEventListener("click", cerrarModalTipo);
  document
    .getElementById("cerrar-modal-caracteristica")
    .addEventListener("click", cerrarModalCaracteristica);
  document
    .getElementById("cerrar-modal-confirmar")
    .addEventListener("click", cerrarModalConfirmar);

  // Eventos de cancelar
  document
    .getElementById("cancelar-tipo")
    .addEventListener("click", cerrarModalTipo);
  document
    .getElementById("cancelar-caracteristica")
    .addEventListener("click", cerrarModalCaracteristica);
  elementos.cancelarEliminar.addEventListener("click", cerrarModalConfirmar);

  // Evento de confirmar eliminación
  elementos.confirmarEliminar.addEventListener("click", confirmarEliminacion);

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("admin-modal")) {
      e.target.style.display = "none";
    }
  });
}

// Funciones de tabs
function cambiarTab(tabId) {
  // Actualizar botones
  elementos.tabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Actualizar contenido
  elementos.tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === `tab-${tabId}`);
  });
}

// Funciones de carga de datos
async function cargarTiposHabitacion() {
  try {
    const response = await fetch(
      "/api/tipoHabitaciones/getTipoHabitaciones.php"
    );
    const result = await response.json();

    if (result.success) {
      renderizarTiposHabitacion(result.data);
    } else {
      showErrorToast("Error al cargar tipos de habitación: " + result.error);
    }
  } catch (error) {
    showErrorToast("Error de conexión al cargar tipos de habitación");
  }
}

async function cargarCaracteristicas() {
  try {
    const response = await fetch("/api/caracteristicas/getCaracteristicas.php");
    const result = await response.json();

    if (result.success) {
      renderizarCaracteristicas(result.caracteristicas);
    } else {
      showErrorToast("Error al cargar características: " + result.error);
    }
  } catch (error) {
    showErrorToast("Error de conexión al cargar características");
  }
}

async function cargarEstadisticas() {
  try {
    const response = await fetch("/api/tipoHabitaciones/stats.php");
    const result = await response.json();

    if (result.success) {
      actualizarEstadisticas(result.stats);
    } else {
      showErrorToast("Error al cargar estadísticas: " + result.error);
    }
  } catch (error) {
    showErrorToast("Error de conexión al cargar estadísticas");
  }
}

function actualizarEstadisticas(stats) {
  elementos.totalTipos.textContent = stats.total_tipos || 0;
  elementos.totalCaracteristicas.textContent = stats.total_caracteristicas || 0;
  elementos.precioPromedio.textContent = `$${stats.precio_promedio || 0}`;
  elementos.totalHabitaciones.textContent = stats.total_habitaciones || 0;
}

// Funciones de renderizado
function renderizarTiposHabitacion(tiposHabitacion) {
  console.log(tiposHabitacion, "tiposHabitacion");
  if (tiposHabitacion.length === 0) {
    elementos.tableTipos.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-bed"></i>
          <h3>No hay tipos de habitación</h3>
          <p>Comienza creando tu primer tipo de habitación</p>
        </td>
      </tr>
    `;
    return;
  }

  elementos.tableTipos.innerHTML = tiposHabitacion
    .map(
      (tipo) => `
    <tr>
      <td class="font-medium">${tipo.nombre}</td>
      <td>
        <div class="max-w-xs truncate" title="${tipo.descripcion}">
          ${tipo.descripcion}
        </div>
      </td>
      <td>
        <div class="precio-display">
          <span>S/. ${parseFloat(tipo.precio_noche).toFixed(2)}</span>
        </div>
      </td>
      <td>
        <span class="status-badge info">${
          tipo.habitaciones_count || 0
        } habitaciones</span>
      </td>
      <td>
        <span class="caracteristicas-badge">
          <i class="fas fa-tags"></i>
          ${tipo.caracteristicas_count || 0} características
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn info" onclick="verDetallesTipo(${
            tipo.id_tipo_habitacion
          })" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn warning" onclick="editarTipo(${
            tipo.id_tipo_habitacion
          })" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn danger" onclick="eliminarTipo(${
            tipo.id_tipo_habitacion
          })" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

function renderizarCaracteristicas(caracteristicas) {
  if (caracteristicas.length === 0) {
    elementos.tableCaracteristicas.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <i class="fas fa-tags"></i>
          <h3>No hay características</h3>
          <p>Comienza creando tu primera característica</p>
        </td>
      </tr>
    `;
    return;
  }

  elementos.tableCaracteristicas.innerHTML = caracteristicas
    .map(
      (caracteristica) => `
    <tr>
      <td class="font-medium">${caracteristica.nombre}</td>
      <td>
        <div class="max-w-md" title="${caracteristica.descripcion}">
          ${caracteristica.descripcion}
        </div>
      </td>
      <td>
        <span class="status-badge info">${
          caracteristica.habitaciones_count || 0
        } habitaciones</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn warning" onclick="editarCaracteristica(${
            caracteristica.id_caracteristica
          })" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn danger" onclick="eliminarCaracteristica(${
            caracteristica.id_caracteristica
          })" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

// Funciones de filtrado
function filtrarTipos() {
  const termino = elementos.searchTipos.value.toLowerCase();
  const filas = elementos.tableTipos.querySelectorAll("tr");

  filas.forEach((fila) => {
    const nombre = fila.cells[0]?.textContent.toLowerCase() || "";
    const descripcion = fila.cells[1]?.textContent.toLowerCase() || "";

    if (nombre.includes(termino) || descripcion.includes(termino)) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}

function filtrarCaracteristicas() {
  const termino = elementos.searchCaracteristicas.value.toLowerCase();
  const filas = elementos.tableCaracteristicas.querySelectorAll("tr");

  filas.forEach((fila) => {
    const nombre = fila.cells[0]?.textContent.toLowerCase() || "";
    const descripcion = fila.cells[1]?.textContent.toLowerCase() || "";

    if (nombre.includes(termino) || descripcion.includes(termino)) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}

// Funciones de modales
function abrirModalTipo(tipo = null) {
  modoEdicion = tipo !== null;
  tipoSeleccionado = tipo;

  // Actualizar título del modal
  document.getElementById("modal-tipo-titulo").textContent = modoEdicion
    ? "Editar Tipo de Habitación"
    : "Nuevo Tipo de Habitación";

  // Limpiar o llenar formulario
  if (modoEdicion) {
    elementos.nombreTipo.value = tipo.nombre;
    elementos.precioTipo.value = tipo.precio_noche;
    elementos.descripcionTipo.value = tipo.descripcion;
  } else {
    elementos.formTipo.reset();
  }

  // Cargar características en el grid
  renderizarCaracteristicasGrid();

  elementos.modalTipo.style.display = "flex";
}

function abrirModalCaracteristica(caracteristica = null) {
  modoEdicion = caracteristica !== null;
  caracteristicaSeleccionada = caracteristica;

  // Actualizar título del modal
  document.getElementById("modal-caracteristica-titulo").textContent =
    modoEdicion ? "Editar Característica" : "Nueva Característica";

  // Limpiar o llenar formulario
  if (modoEdicion) {
    elementos.nombreCaracteristica.value = caracteristica.nombre;
    elementos.descripcionCaracteristica.value = caracteristica.descripcion;
  } else {
    elementos.formCaracteristica.reset();
  }

  elementos.modalCaracteristica.style.display = "flex";
}

function cerrarModalTipo() {
  elementos.modalTipo.style.display = "none";
  elementos.formTipo.reset();
  tipoSeleccionado = null;
  modoEdicion = false;
}

function cerrarModalCaracteristica() {
  elementos.modalCaracteristica.style.display = "none";
  elementos.formCaracteristica.reset();
  caracteristicaSeleccionada = null;
  modoEdicion = false;
}

function cerrarModalConfirmar() {
  elementos.modalConfirmar.style.display = "none";
}

function renderizarCaracteristicasGrid() {
  elementos.caracteristicasTipo.innerHTML = caracteristicas
    .map(
      (caracteristica) => `
    <div class="caracteristica-item">
      <input type="checkbox" 
             id="char-${caracteristica.id_caracteristica}" 
             name="caracteristicas[]" 
             value="${caracteristica.id_caracteristica}"
             ${
               tipoSeleccionado?.caracteristicas_asignadas?.includes(
                 caracteristica.id_caracteristica
               )
                 ? "checked"
                 : ""
             }>
      <label for="char-${caracteristica.id_caracteristica}">${
        caracteristica.nombre
      }</label>
    </div>
  `
    )
    .join("");
}

// Funciones de manejo de formularios
async function manejarSubmitTipo(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const datos = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    precio: parseFloat(formData.get("precio")),
    aforo: parseInt(formData.get("aforo")),
    caracteristicas: Array.from(formData.getAll("caracteristicas")).map((id) =>
      parseInt(id)
    ),
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    await withButtonLoader(
      submitBtn,
      async () => {
        const url = window.tipoEditando
          ? `/api/tipoHabitaciones/updateTipo.php?id=${window.tipoEditando}`
          : "/api/tipoHabitaciones/insertTipo.php";

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });

        const result = await response.json();

        if (result.success) {
          showSuccessToast(result.message);
          cerrarModalTipo();
          await recargarDatos();
        } else {
          throw new Error(result.error);
        }

        return result;
      },
      window.tipoEditando ? "Actualizando..." : "Creando..."
    );
  } catch (error) {
    showErrorToast("Error al guardar tipo: " + error.message);
  }
}

async function manejarSubmitCaracteristica(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const datos = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    await withButtonLoader(
      submitBtn,
      async () => {
        const url = window.caracteristicaEditando
          ? `/api/caracteristicas/updateCaracteristica.php?id=${window.caracteristicaEditando}`
          : "/api/caracteristicas/insertCaracteristica.php";

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });

        const result = await response.json();

        if (result.success) {
          showSuccessToast(result.message);
          cerrarModalCaracteristica();
          await recargarDatos();
        } else {
          throw new Error(result.error);
        }

        return result;
      },
      window.caracteristicaEditando ? "Actualizando..." : "Creando..."
    );
  } catch (error) {
    showErrorToast("Error al guardar característica: " + error.message);
  }
}

// Funciones de acciones
function verDetallesTipo(id) {
  const tipo = tiposHabitacion.find((t) => t.id_tipo_habitacion === id);
  if (tipo) {
    // Aquí puedes implementar la lógica para mostrar detalles
    console.log("Ver detalles del tipo:", tipo);
  }
}

function editarTipo(id) {
  const tipo = tiposHabitacion.find((t) => t.id_tipo_habitacion === id);
  if (tipo) {
    abrirModalTipo(tipo);
  }
}

function editarCaracteristica(id) {
  const caracteristica = caracteristicas.find(
    (c) => c.id_caracteristica === id
  );
  if (caracteristica) {
    abrirModalCaracteristica(caracteristica);
  }
}

function eliminarTipo(id) {
  const tipo = tiposHabitacion.find((t) => t.id_tipo_habitacion === id);
  if (tipo) {
    mostrarModalConfirmacion(
      "Eliminar Tipo de Habitación",
      `¿Estás seguro de que deseas eliminar el tipo "${tipo.nombre}"? Esta acción no se puede deshacer.`,
      () => eliminarTipoConfirmado(id)
    );
  }
}

function eliminarCaracteristica(id) {
  const caracteristica = caracteristicas.find(
    (c) => c.id_caracteristica === id
  );
  if (caracteristica) {
    mostrarModalConfirmacion(
      "Eliminar Característica",
      `¿Estás seguro de que deseas eliminar la característica "${caracteristica.nombre}"? Esta acción no se puede deshacer.`,
      () => eliminarCaracteristicaConfirmada(id)
    );
  }
}

function mostrarModalConfirmacion(titulo, mensaje, accion) {
  elementos.modalConfirmarTitulo.textContent = titulo;
  elementos.modalConfirmarMensaje.textContent = mensaje;
  elementos.confirmarEliminar.onclick = accion;
  elementos.modalConfirmar.style.display = "flex";
}

async function confirmarEliminacion() {
  // Esta función se sobrescribe según el contexto
  cerrarModalConfirmar();
}

async function eliminarTipoConfirmado(id) {
  try {
    await withLoadingModal(async () => {
      const response = await fetch(
        `/api/tipoHabitaciones/deleteTipo.php?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        showSuccessToast(result.message);
        await recargarDatos();
      } else {
        throw new Error(result.error);
      }

      return result;
    }, "Eliminando tipo de habitación...");
  } catch (error) {
    showErrorToast("Error al eliminar tipo: " + error.message);
  }
}

async function eliminarCaracteristicaConfirmada(id) {
  try {
    await withLoadingModal(async () => {
      const response = await fetch(
        `/api/caracteristicas/deleteCaracteristica.php?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        showSuccessToast(result.message);
        await recargarDatos();
      } else {
        throw new Error(result.error);
      }

      return result;
    }, "Eliminando característica...");
  } catch (error) {
    showErrorToast("Error al eliminar característica: " + error.message);
  }
}

// Función para recargar datos
async function recargarDatos() {
  await Promise.all([
    cargarTiposHabitacion(),
    cargarCaracteristicas(),
    cargarEstadisticas(),
  ]);

  renderizarTiposHabitacion();
  renderizarCaracteristicas();
}

inicializarTiposCaracteristicas();
