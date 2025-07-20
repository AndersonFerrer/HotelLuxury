// --- Utilidades de loaderUtils ---
import {
  withLoadingModal,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

// --- Configuración de rutas API ---
const API_BASE = "../api";
const ENDPOINTS = {
  tipos: {
    list: `${API_BASE}/tipoHabitaciones/getTipoHabitaciones.php`,
    create: `${API_BASE}/tipoHabitaciones/insertTipo.php`,
    update: (id) => `${API_BASE}/tipoHabitaciones/updateTipo.php?id=${id}`,
    delete: (id) => `${API_BASE}/tipoHabitaciones/deleteTipo.php?id=${id}`,
  },
  caracteristicas: {
    list: `${API_BASE}/caracteristicas/getCaracteristicas.php`,
    create: `${API_BASE}/caracteristicas/insertCaracteristica.php`,
    update: (id) =>
      `${API_BASE}/caracteristicas/updateCaracteristica.php?id=${id}`,
    delete: (id) =>
      `${API_BASE}/caracteristicas/deleteCaracteristica.php?id=${id}`,
  },
};

// --- Estado global ---
let tipos = [];
let caracteristicas = [];
let tiposFiltrados = [];
let caracteristicasFiltradas = [];

// --- Fetch helpers ---
async function fetchTipos() {
  const res = await fetch(ENDPOINTS.tipos.list);
  const data = await res.json();
  tipos = data.data || [];
  tiposFiltrados = tipos;
}

async function fetchCaracteristicas() {
  const res = await fetch(ENDPOINTS.caracteristicas.list);
  const data = await res.json();
  caracteristicas = data.caracteristicas || [];
  caracteristicasFiltradas = caracteristicas;
}

// --- Renderizado de tablas ---
function renderTablaTipos() {
  const tbody = document.getElementById("tipos-tbody");
  tbody.innerHTML = "";
  if (!tiposFiltrados.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class='empty-state'><i class='fas fa-bed'></i><h3>No hay tipos de habitación</h3></div></td></tr>`;
    return;
  }
  tiposFiltrados.forEach((tipo) => {
    console.log(tipo);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tipo.nombre}</td>
      <td>${tipo.descripcion}</td>
      <td>S/ ${Number(tipo.precio_noche).toFixed(2)}</td>
      <td>${tipo.habitaciones_count || 0}</td>
      <td>
        ${
          (tipo.caracteristicas_asignadas || [])
            .map((cid) => {
              const c = caracteristicas.find((x) => x.id_caracteristica == cid);
              return c ? `<span class='badge'>${c.nombre}</span>` : "";
            })
            .join(" ") || '<span style="color:#888">Ninguna</span>'
        }
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-view" title="Ver" data-id="${
            tipo.id_tipo_habitacion
          }" data-action="ver"><i class="fas fa-eye"></i></button>
          <button class="btn-action btn-edit" title="Editar" data-id="${
            tipo.id_tipo_habitacion
          }" data-action="editar"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" title="Eliminar" data-id="${
            tipo.id_tipo_habitacion
          }" data-action="eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderTablaCaracteristicas() {
  const tbody = document.getElementById("caracteristicas-tbody");
  tbody.innerHTML = "";
  if (!caracteristicasFiltradas.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class='empty-state'><i class='fas fa-tags'></i><h3>No hay características</h3></div></td></tr>`;
    return;
  }
  caracteristicasFiltradas.forEach((car) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${car.nombre}</td>
      <td>${car.descripcion}</td>
      <td>${car.habitaciones_count ?? "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-view" title="Ver" data-id="${
            car.id_caracteristica
          }" data-action="ver"><i class="fas fa-eye"></i></button>
          <button class="btn-action btn-edit" title="Editar" data-id="${
            car.id_caracteristica
          }" data-action="editar"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" title="Eliminar" data-id="${
            car.id_caracteristica
          }" data-action="eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- Filtros y búsqueda ---
document.getElementById("search-tipo").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  tiposFiltrados = tipos.filter(
    (t) =>
      t.nombre.toLowerCase().includes(q) ||
      t.descripcion.toLowerCase().includes(q)
  );
  renderTablaTipos();
});

document
  .getElementById("search-caracteristica")
  .addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    caracteristicasFiltradas = caracteristicas.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q)
    );
    renderTablaCaracteristicas();
  });

// --- Modales ---
const modalTipo = document.getElementById("modal-tipo");
const modalTituloTipo = document.getElementById("modal-titulo-tipo");
const modalContenidoTipo = document.getElementById("modal-contenido-tipo");
const modalActionsTipo = document.getElementById("modal-actions-tipo");

const modalCar = document.getElementById("modal-caracteristica");
const modalTituloCar = document.getElementById("modal-titulo-caracteristica");
const modalContenidoCar = document.getElementById(
  "modal-contenido-caracteristica"
);
const modalActionsCar = document.getElementById("modal-actions-caracteristica");

// --- Helpers para formularios ---
function formTipoHTML(data = {}, modo = "crear") {
  const asignadas =
    data.caracteristicas_asignadas || data.caracteristicas || [];
  return `
    <div class="form-row">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" id="tipo-nombre" value="${
          data.nombre ?? ""
        }" required maxlength="60">
      </div>
      <div class="form-group">
        <label>Precio por Noche</label>
        <input type="number" id="tipo-precio" value="${
          data.precio_noche ?? ""
        }" min="0" step="0.01" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Descripción</label>
        <textarea id="tipo-descripcion" rows="3" maxlength="255">${
          data.descripcion ?? ""
        }</textarea>
      </div>
    </div>
    <div class="form-group" style="grid-column: 1 / -1;">
      <label>Características Incluidas</label>
      <div class="characteristics-checkbox-grid">
        ${caracteristicas
          .map(
            (c) => `
          <label><input type="checkbox" class="tipo-carac-check" value="${
            c.id_caracteristica
          }" ${asignadas.includes(c.id_caracteristica) ? "checked" : ""}> ${
              c.nombre
            }</label>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function formCarHTML(data = {}, modo = "crear") {
  return `
    <div class="form-row">
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Nombre</label>
        <input type="text" id="car-nombre" value="${
          data.nombre ?? ""
        }" required maxlength="60">
      </div>
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Descripción</label>
        <textarea id="car-descripcion" rows="3" maxlength="255">${
          data.descripcion ?? ""
        }</textarea>
      </div>
    </div>
  `;
}

// --- Acciones CRUD Tipos ---
document.getElementById("btn-nuevo-tipo").onclick = () => {
  modalTituloTipo.textContent = "Nuevo Tipo de Habitación";
  modalContenidoTipo.innerHTML = formTipoHTML();
  modalActionsTipo.innerHTML = `<button type="button" class="btn-cancelar">Cancelar</button><button type="button" class="btn-confirmar">Guardar</button>`;
  modalTipo.showModal();
  modalActionsTipo.querySelector(".btn-cancelar").onclick = () =>
    modalTipo.close();
  modalActionsTipo.querySelector(".btn-confirmar").onclick = async () => {
    const nombre = document.getElementById("tipo-nombre").value.trim();
    const precio = document.getElementById("tipo-precio").value;
    const descripcion = document
      .getElementById("tipo-descripcion")
      .value.trim();
    const caracs = Array.from(
      document.querySelectorAll(".tipo-carac-check:checked")
    ).map((cb) => parseInt(cb.value));
    if (!nombre || !precio) {
      showErrorToast("Completa todos los campos");
      return;
    }
    const body = {
      nombre,
      precio,
      descripcion,
      caracteristicas: caracs,
    };
    await withLoadingModal(async () => {
      const res = await fetch(ENDPOINTS.tipos.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        modalTipo.close();
        showSuccessToast("Tipo creado");
        await cargarTodo();
      } else {
        showErrorToast(data.error || "Error al crear");
      }
    }, "Guardando tipo...");
  };
};

document.getElementById("tipos-tbody").onclick = async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const tipo = tipos.find((t) => t.id_tipo_habitacion == id);
  if (btn.dataset.action === "editar") {
    modalTituloTipo.textContent = "Editar Tipo de Habitación";
    modalContenidoTipo.innerHTML = formTipoHTML(tipo, "editar");
    modalActionsTipo.innerHTML = `<button type="button" class="btn-cancelar">Cancelar</button><button type="button" class="btn-confirmar">Guardar</button>`;
    modalTipo.showModal();
    modalActionsTipo.querySelector(".btn-cancelar").onclick = () =>
      modalTipo.close();
    modalActionsTipo.querySelector(".btn-confirmar").onclick = async () => {
      const nombre = document.getElementById("tipo-nombre").value.trim();
      const precio = document.getElementById("tipo-precio").value;
      const descripcion = document
        .getElementById("tipo-descripcion")
        .value.trim();
      const caracs = Array.from(
        document.querySelectorAll(".tipo-carac-check:checked")
      ).map((cb) => parseInt(cb.value));
      if (!nombre || !precio) {
        showErrorToast("Completa todos los campos");
        return;
      }
      const body = {
        nombre,
        precio,
        descripcion,
        caracteristicas: caracs,
      };
      await withLoadingModal(async () => {
        const res = await fetch(ENDPOINTS.tipos.update(id), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          modalTipo.close();
          showSuccessToast("Tipo actualizado");
          await cargarTodo();
        } else {
          showErrorToast(data.error || "Error al actualizar");
        }
      }, "Actualizando tipo...");
    };
  } else if (btn.dataset.action === "eliminar") {
    if (!confirm("¿Eliminar este tipo de habitación?")) return;
    await withLoadingModal(async () => {
      const res = await fetch(ENDPOINTS.tipos.delete(id), { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showSuccessToast("Tipo eliminado");
        await cargarTodo();
      } else {
        showErrorToast(data.error || "Error al eliminar");
      }
    }, "Eliminando tipo...");
  } else if (btn.dataset.action === "ver") {
    modalTituloTipo.textContent = "Detalle del Tipo de Habitación";
    modalContenidoTipo.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>Nombre</label><div>${
          tipo.nombre
        }</div></div>
        <div class="form-group"><label>Precio por Noche</label><div>S/ ${Number(
          tipo.precio_noche
        ).toFixed(2)}</div></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="grid-column: 1 / -1;"><label>Descripción</label><div>${
          tipo.descripcion
        }</div></div>
      </div>
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Características Incluidas</label>
        <div>
          ${
            (tipo.caracteristicas_asignadas || [])
              .map((cid) => {
                const c = caracteristicas.find(
                  (x) => x.id_caracteristica == cid
                );
                return c ? `<span class='badge'>${c.nombre}</span>` : "";
              })
              .join(" ") || '<span style="color:#888">Ninguna</span>'
          }
        </div>
      </div>
    `;
    modalActionsTipo.innerHTML = `<button type="button" class="btn-cancelar">Cerrar</button>`;
    modalTipo.showModal();
    modalActionsTipo.querySelector(".btn-cancelar").onclick = () =>
      modalTipo.close();
  }
};

// --- Acciones CRUD Características ---
document.getElementById("btn-nueva-caracteristica").onclick = () => {
  modalTituloCar.textContent = "Nueva Característica";
  modalContenidoCar.innerHTML = formCarHTML();
  modalActionsCar.innerHTML = `<button type="button" class="btn-cancelar">Cancelar</button><button type="button" class="btn-confirmar">Guardar</button>`;
  modalCar.showModal();
  modalActionsCar.querySelector(".btn-cancelar").onclick = () =>
    modalCar.close();
  modalActionsCar.querySelector(".btn-confirmar").onclick = async () => {
    const nombre = document.getElementById("car-nombre").value.trim();
    const descripcion = document.getElementById("car-descripcion").value.trim();
    if (!nombre) return showErrorToast("Completa todos los campos");
    const body = { nombre, descripcion };
    const res = await fetch(ENDPOINTS.caracteristicas.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      modalCar.close();
      showSuccessToast("Característica creada");
      await cargarTodo();
    } else {
      showErrorToast(data.error || "Error al crear");
    }
  };
};

document.getElementById("caracteristicas-tbody").onclick = async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const car = caracteristicas.find((c) => c.id_caracteristica == id);
  if (btn.dataset.action === "editar") {
    modalTituloCar.textContent = "Editar Característica";
    modalContenidoCar.innerHTML = formCarHTML(car, "editar");
    modalActionsCar.innerHTML = `<button type="button" class="btn-cancelar">Cancelar</button><button type="button" class="btn-confirmar">Guardar</button>`;
    modalCar.showModal();
    modalActionsCar.querySelector(".btn-cancelar").onclick = () =>
      modalCar.close();
    modalActionsCar.querySelector(".btn-confirmar").onclick = async () => {
      const nombre = document.getElementById("car-nombre").value.trim();
      const descripcion = document
        .getElementById("car-descripcion")
        .value.trim();
      if (!nombre) return showErrorToast("Completa todos los campos");
      const body = { nombre, descripcion };
      const res = await fetch(ENDPOINTS.caracteristicas.update(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        modalCar.close();
        showSuccessToast("Característica actualizada");
        await cargarTodo();
      } else {
        showErrorToast(data.error || "Error al actualizar");
      }
    };
  } else if (btn.dataset.action === "eliminar") {
    if (!confirm("¿Eliminar esta característica?")) return;
    const res = await fetch(ENDPOINTS.caracteristicas.delete(id), {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      modalCar.close();
      showSuccessToast("Característica eliminada");
      await cargarTodo();
    } else {
      showErrorToast(data.error || "Error al eliminar");
    }
  } else if (btn.dataset.action === "ver") {
    modalTituloCar.textContent = "Detalle de la Característica";
    modalContenidoCar.innerHTML = `
      <div class="form-row">
        <div class="form-group" style="grid-column: 1 / -1;"><label>Nombre</label><div>${car.nombre}</div></div>
        <div class="form-group" style="grid-column: 1 / -1;"><label>Descripción</label><div>${car.descripcion}</div></div>
      </div>
    `;
    modalActionsCar.innerHTML = `<button type="button" class="btn-cancelar">Cerrar</button>`;
    modalCar.showModal();
    modalActionsCar.querySelector(".btn-cancelar").onclick = () =>
      modalCar.close();
  }
};

// Cerrar modales al hacer clic en backdrop
modalTipo?.addEventListener("click", (e) => {
  if (e.target === modalTipo) modalTipo.close();
});
modalCar?.addEventListener("click", (e) => {
  if (e.target === modalCar) modalCar.close();
});

// --- Inicialización ---
async function cargarTodo() {
  await fetchCaracteristicas();
  await fetchTipos();
  renderTablaTipos();
  renderTablaCaracteristicas();
}

cargarTodo();
