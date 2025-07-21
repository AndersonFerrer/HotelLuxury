import {
  withButtonLoader,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

let empleados = [];
let filteredEmpleados = [];

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

function updateTableEmpleados(data) {
  const tbody = document.getElementById("empleados-tbody");
  tbody.innerHTML = "";
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan='7' class='empty-state'>No hay empleados registrados</td></tr>`;
    return;
  }
  data.forEach((empleado) => {
    const row = document.createElement("tr");
    row.classList.add("empleado-fila");
    row.innerHTML = `
      <td class="empleado-flex"><div class="empleado-avatar">${getInitials(
        empleado.nombres,
        empleado.apellidos
      )}</div>
          <div class="empleado-info">
            <span class="empleado-nombre">${empleado.nombres} ${
      empleado.apellidos
    }</span>
            <span class="empleado-email"><i class="fas fa-envelope"></i> ${
              empleado.correo || "-"
            }</span>
          </div></td>
      <td><div class="empleado-documento">
            <span class="documento-numero">${empleado.numero_documento}</span>
            <span class="documento-tipo">${empleado.tipo_documento}</span>
          </div></td>
      <td>${empleado.cargo || "-"}</td>
      <td>${empleado.telefono || "-"}</td>
      <td>${formatDate(empleado.fecha_ingreso)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-view" title="Ver" data-id="${
            empleado.id || empleado.id_empleado
          }"><i class="fas fa-eye"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  // Re-attach event listeners after table update
  configurarEventosFilasEmpleados();
}

function filterEmpleados() {
  const searchTerm = document
    .getElementById("search-empleado-input")
    .value.toLowerCase();
  filteredEmpleados = empleados.filter((emp) => {
    const fullName = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      emp.numero_documento.includes(searchTerm) ||
      (emp.correo || "").toLowerCase().includes(searchTerm)
    );
  });
  updateTableEmpleados(filteredEmpleados);
  document.getElementById("filtered-empleados-count").textContent =
    filteredEmpleados.length;
}

function configurarEventosFilasEmpleados() {
  document.querySelectorAll(".empleado-fila .btn-view").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      // Match both possible id fields
      const empleado = empleados.find((e) => e.id_empleado == id || e.id == id);
      if (empleado) mostrarModalEmpleado(empleado);
    };
  });
}

function mostrarModalEmpleado(empleado) {
  const modal = document.getElementById("modal-empleado");
  const modalContenido = document.getElementById("modal-empleado-contenido");
  const modalTitulo = document.getElementById("modal-empleado-titulo");
  modalTitulo.textContent = `Detalles del Empleado - ${empleado.nombres} ${empleado.apellidos}`;
  modalContenido.innerHTML = `
    <div class="empleado-details-grid">
      <div class="detail-card">
        <h3><i class="fas fa-user"></i> Información Personal</h3>
        <div class="detail-item"><span class="detail-label">Nombre:</span><span class="detail-value">${
          empleado.nombres
        } ${empleado.apellidos}</span></div>
        <div class="detail-item"><span class="detail-label">Documento:</span><span class="detail-value">${
          empleado.tipo_documento
        } - ${empleado.numero_documento}</span></div>
        <div class="detail-item"><span class="detail-label">Correo:</span><span class="detail-value">${
          empleado.correo || "-"
        }</span></div>
        <div class="detail-item"><span class="detail-label">Teléfono:</span><span class="detail-value">${
          empleado.telefono || "-"
        }</span></div>
      </div>
      <div class="detail-card">
        <h3><i class="fas fa-briefcase"></i> Información Laboral</h3>
        <div class="detail-item"><span class="detail-label">Cargo:</span><span class="detail-value">${
          empleado.cargo || "-"
        }</span></div>
        <div class="detail-item"><span class="detail-label">Fecha de Ingreso:</span><span class="detail-value">${formatDate(
          empleado.fecha_ingreso
        )}</span></div>
        <div class="detail-item"><span class="detail-label">Estado:</span><span class="detail-value">${
          typeof empleado.estado !== "undefined" && empleado.estado !== null
            ? empleado.estado
            : "Activo"
        }</span></div>
      </div>
    </div>
  `;
  modal.showModal();
  document.querySelector("#modal-empleado .btn-cancelar").onclick = () =>
    modal.close();
}

document
  .getElementById("search-empleado-input")
  .addEventListener("input", filterEmpleados);

// MODAL AGREGAR EMPLEADO
const btnNuevoEmpleado = document.getElementById("btn-nuevo-empleado");
const modalAgregarEmpleado = document.getElementById("modal-agregar-empleado");
const formAgregarEmpleado = document.getElementById("form-agregar-empleado");

if (btnNuevoEmpleado && modalAgregarEmpleado) {
  btnNuevoEmpleado.addEventListener("click", () => {
    formAgregarEmpleado.reset();
    modalAgregarEmpleado.showModal();
  });
}

// Cerrar modal agregar empleado
modalAgregarEmpleado
  ?.querySelector(".btn-cancelar")
  ?.addEventListener("click", () => {
    modalAgregarEmpleado.close();
  });

// Alternar visibilidad de contraseña
modalAgregarEmpleado?.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const input = btn.parentElement.querySelector("input");
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
      btn.querySelector("i").classList.toggle("fa-eye");
      btn.querySelector("i").classList.toggle("fa-eye-slash");
    }
  });
});

// Validación básica del formulario (puedes mejorar luego)

formAgregarEmpleado?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const submitBtn = formAgregarEmpleado.querySelector('button[type="submit"]');
  // Validar todos los campos requeridos
  const requiredFields = formAgregarEmpleado.querySelectorAll("[required]");
  let allFilled = true;
  requiredFields.forEach((field) => {
    if (!field.value || field.value.trim() === "") {
      allFilled = false;
    }
  });
  if (!allFilled) {
    showErrorToast("Por favor completa todos los campos obligatorios.");
    return;
  }
  const pass = formAgregarEmpleado["password"].value;
  const pass2 = formAgregarEmpleado["password2"].value;
  if (pass !== pass2) {
    showErrorToast("Las contraseñas no coinciden.");
    return;
  }
  // Validación de longitud de contraseña
  if (pass.length < 8) {
    showErrorToast("La contraseña debe tener al menos 8 caracteres.");
    return;
  }
  // Preparar objeto de datos
  const formData = {
    nombres: formAgregarEmpleado["nombres"].value.trim(),
    apellidos: formAgregarEmpleado["apellidos"].value.trim(),
    id_tipo_documento: formAgregarEmpleado["tipo_documento"].value,
    numero_documento: formAgregarEmpleado["numero_documento"].value.trim(),
    telefono: formAgregarEmpleado["telefono"].value.trim(),
    correo: formAgregarEmpleado["correo"].value.trim(),
    password: pass,
    region: formAgregarEmpleado["region"].value.trim(),
    provincia: formAgregarEmpleado["provincia"].value.trim(),
    distrito: formAgregarEmpleado["distrito"].value.trim(),
    direccion_detallada: formAgregarEmpleado["direccion"].value.trim(),
    id_puesto: formAgregarEmpleado["cargo"].value,
  };
  try {
    await withButtonLoader(
      submitBtn,
      async () => {
        const response = await fetch("../api/empleados/registrar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          showSuccessToast("Empleado registrado exitosamente");
          formAgregarEmpleado.reset();
          modalAgregarEmpleado.close();
          await fetchEmpleados();
        } else {
          showErrorToast(result.error || "No se pudo registrar el empleado");
        }
        return result;
      },
      "Registrando..."
    );
  } catch (error) {
    console.error("Error en registro de empleado:", error);
    showErrorToast("Error al conectar con el servidor");
  }
});

async function fetchEmpleados() {
  try {
    const response = await fetch("../api/empleados/listar.php");
    const data = await response.json();
    if (data.success && Array.isArray(data.empleados)) {
      empleados = data.empleados;
      filteredEmpleados = [...empleados];
      updateTableEmpleados(filteredEmpleados);
    } else {
      throw new Error("Respuesta inesperada del servidor");
    }
  } catch (error) {
    alert("Error al cargar empleados: " + error.message);
    empleados = [];
    filteredEmpleados = [];
    updateTableEmpleados([]);
  }
}

fetchEmpleados();
configurarEventosFilasEmpleados();
