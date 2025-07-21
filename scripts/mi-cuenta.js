import { getSession, clearSessionCache, cerrarSesion } from "./authService.js";
import {
  withButtonLoader,
  withLoadingModal,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

// --- Datos del usuario y reservas ---
let userData = {
  nombres: "Cargando...",
  apellidos: "Cargando...",
  email: "cargando@ejemplo.com",
  phone: "+1 234 567 890",
  address: "Calle Principal 123",
  city: "Ciudad",
  province: "Provincia",
  region: "Región",
};

let bookings = [];

// --- Cargar datos del usuario ---
async function cargarDatosUsuario() {
  try {
    const data = await getSession();
    if (data.success && data.usuario) {
      userData.nombres = data.usuario.nombres;
      userData.apellidos = data.usuario.apellidos;
      userData.email = data.usuario.correo;
      userData.phone = data.usuario.telefono || "+1 234 567 890";

      // Usar la información de dirección del servidor si está disponible
      if (data.usuario.direccion) {
        userData.address =
          data.usuario.direccion.direccion_detallada || "Calle Principal 123";
        userData.city = data.usuario.direccion.distrito || "Ciudad";
        userData.province = data.usuario.direccion.provincia || "Provincia";
        userData.region = data.usuario.direccion.region || "Región";
      }

      mostrarDatosPerfil();
    }
  } catch (error) {
    console.error("Error al cargar datos del usuario:", error);
  }
}

// --- Cargar reservas del usuario ---
async function cargarReservas() {
  try {
    const response = await fetch("/api/reservas/getByCliente.php");
    const data = await response.json();

    if (data.success) {
      bookings = data.data;
      mostrarReservas();
    } else {
      console.error("Error al cargar reservas:", data.error);
      bookings = [];
      mostrarReservas();
    }
  } catch (error) {
    console.error("Error al cargar reservas:", error);
    bookings = [];
    mostrarReservas();
  }
}

// --- Tabs ---
const tabBtns = document.querySelectorAll(".tab-btn[data-tab]");
const sidebarBtns = document.querySelectorAll(".sidebar-nav-btn[data-tab]");
const tabContents = document.querySelectorAll(".tab-content");

function switchTab(tab) {
  // Activar botones de tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-nav-btn")
    .forEach((b) => b.classList.remove("active"));

  // Activar botón correspondiente
  document
    .querySelectorAll(`[data-tab="${tab}"]`)
    .forEach((b) => b.classList.add("active"));

  // Mostrar contenido
  tabContents.forEach((tc) => tc.classList.add("hidden"));
  document.getElementById("tab-" + tab).classList.remove("hidden");
}

// Eventos para tabs principales
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    switchTab(tab);
  });
});

// Eventos para sidebar
sidebarBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    switchTab(tab);
  });
});

// --- Perfil: mostrar datos y editar ---
function mostrarDatosPerfil() {
  document.getElementById("profile-nombres").textContent = userData.nombres;
  document.getElementById("profile-apellidos").textContent = userData.apellidos;
  document.getElementById("profile-email").textContent = userData.email;
  document.getElementById("profile-phone").textContent = userData.phone;
  document.getElementById("profile-address").textContent = userData.address;
  document.getElementById("profile-city").textContent = userData.city;
  document.getElementById("profile-province").textContent = userData.province;
  document.getElementById("profile-region").textContent = userData.region;
  // Sidebar
  document.getElementById(
    "sidebar-username"
  ).textContent = `${userData.nombres} ${userData.apellidos}`;
  document.getElementById("sidebar-email").textContent = userData.email;
}

function activarEdicionPerfil() {
  // Mostrar inputs y botones de acción
  document.getElementById("edit-profile-btn").classList.add("hidden");
  document.getElementById("edit-profile-actions").classList.remove("hidden");
  // Inputs
  document.getElementById("profile-nombres").classList.add("hidden");
  document.getElementById("input-nombres").classList.remove("hidden");
  document.getElementById("input-nombres").value = userData.nombres;
  document.getElementById("profile-apellidos").classList.add("hidden");
  document.getElementById("input-apellidos").classList.remove("hidden");
  document.getElementById("input-apellidos").value = userData.apellidos;
  document.getElementById("profile-email").classList.add("hidden");
  document.getElementById("input-email").classList.remove("hidden");
  document.getElementById("input-email").value = userData.email;
  document.getElementById("profile-phone").classList.add("hidden");
  document.getElementById("input-phone").classList.remove("hidden");
  document.getElementById("input-phone").value = userData.phone;
  document.getElementById("profile-address").classList.add("hidden");
  document.getElementById("input-address").classList.remove("hidden");
  document.getElementById("input-address").value = userData.address;
  document.getElementById("profile-city").classList.add("hidden");
  document.getElementById("input-city").classList.remove("hidden");
  document.getElementById("input-city").value = userData.city;
  document.getElementById("profile-province").classList.add("hidden");
  document.getElementById("input-province").classList.remove("hidden");
  document.getElementById("input-province").value = userData.province;
  document.getElementById("profile-region").classList.add("hidden");
  document.getElementById("input-region").classList.remove("hidden");
  document.getElementById("input-region").value = userData.region;
}

function cancelarEdicionPerfil() {
  document.getElementById("edit-profile-btn").classList.remove("hidden");
  document.getElementById("edit-profile-actions").classList.add("hidden");
  // Ocultar inputs
  document.getElementById("profile-nombres").classList.remove("hidden");
  document.getElementById("input-nombres").classList.add("hidden");
  document.getElementById("profile-apellidos").classList.remove("hidden");
  document.getElementById("input-apellidos").classList.add("hidden");
  document.getElementById("profile-email").classList.remove("hidden");
  document.getElementById("input-email").classList.add("hidden");
  document.getElementById("profile-phone").classList.remove("hidden");
  document.getElementById("input-phone").classList.add("hidden");
  document.getElementById("profile-address").classList.remove("hidden");
  document.getElementById("input-address").classList.add("hidden");
  document.getElementById("profile-city").classList.remove("hidden");
  document.getElementById("input-city").classList.add("hidden");
  document.getElementById("profile-province").classList.remove("hidden");
  document.getElementById("input-province").classList.add("hidden");
  document.getElementById("profile-region").classList.remove("hidden");
  document.getElementById("input-region").classList.add("hidden");
}

// --- Guardar perfil ---
async function guardarPerfil() {
  const saveBtn = document.getElementById("save-profile-btn");

  try {
    // Obtener valores de los inputs
    const nombres = document.getElementById("input-nombres").value;
    const apellidos = document.getElementById("input-apellidos").value;
    const email = document.getElementById("input-email").value;
    const phone = document.getElementById("input-phone").value;
    const address = document.getElementById("input-address").value;
    const city = document.getElementById("input-city").value;
    const province = document.getElementById("input-province").value;
    const region = document.getElementById("input-region").value;

    // Validar campos requeridos
    if (!nombres || !apellidos || !email) {
      showErrorToast("Nombres, apellidos y correo electrónico son requeridos");
      return;
    }

    // Preparar datos para enviar
    const datosPerfil = {
      nombres: nombres,
      apellidos: apellidos,
      correo: email,
      telefono: phone,
      direccion: {
        direccion_detallada: address,
        distrito: city,
        provincia: province,
        region: region,
      },
    };

    await withButtonLoader(
      saveBtn,
      async () => {
        // Enviar datos al servidor
        const response = await fetch("/api/auth/updateProfile.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosPerfil),
        });

        const result = await response.json();

        if (result.success) {
          showSuccessToast("Perfil actualizado exitosamente");

          // Actualizar datos locales
          userData.nombres = nombres;
          userData.apellidos = apellidos;
          userData.email = email;
          userData.phone = phone;
          userData.address = address;
          userData.city = city;
          userData.province = province;
          userData.region = region;

          // Limpiar caché de sesión para forzar recarga
          clearSessionCache();

          // Salir del modo edición
          cancelarEdicionPerfil();

          // Recargar datos del usuario
          await cargarDatosUsuario();
        } else {
          showErrorToast("Error al actualizar perfil: " + result.error);
        }

        return result;
      },
      "Guardando..."
    );
  } catch (error) {
    console.error("Error al guardar perfil:", error);
    showErrorToast("Error al guardar perfil. Inténtalo de nuevo.");
  }
}

// --- Eventos de edición de perfil ---
document
  .getElementById("edit-profile-btn")
  .addEventListener("click", activarEdicionPerfil);
document
  .getElementById("cancel-edit-btn")
  .addEventListener("click", cancelarEdicionPerfil);
document
  .getElementById("save-profile-btn")
  .addEventListener("click", guardarPerfil);

// --- Mostrar reservas ---
function getStatusBadge(status) {
  switch (status) {
    case "confirmed":
      return '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Confirmada</span>';
    case "upcoming":
      return '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Próxima</span>';
    case "completed":
      return '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Completada</span>';
    default:
      return "";
  }
}

function mostrarReservas() {
  const cont = document.getElementById("reservas-list");
  cont.innerHTML = "";
  if (bookings.length === 0) {
    cont.innerHTML = "<p>No tienes reservas.</p>";
    return;
  }
  bookings.forEach((booking) => {
    const div = document.createElement("div");
    div.className = "reserva-card";
    div.innerHTML = `
      <div class="reserva-content">
        <div class="reserva-image">
          <img src="${booking.image}" alt="${booking.roomName}" />
        </div>
        <div class="reserva-details">
          <div class="reserva-header">
            <div class="reserva-info">
              <h3>${booking.roomName}</h3>
              <p>${formatDate(booking.checkIn)} - ${formatDate(
      booking.checkOut
    )}</p>
              <p>${booking.guests} ${
      booking.guests === 1 ? "huésped" : "huéspedes"
    }</p>
            </div>
            <div class="reserva-meta">
              <p class="reserva-id">Reserva #${booking.id}</p>
              <p class="reserva-price">S/. ${booking.total}</p>
              <div class="reserva-status">${getStatusBadge(
                booking.status
              )}</div>
            </div>
          </div>
          <div class="reserva-actions">
            <button class="btn btn-outline btn-sm" onclick="alert('Ver detalles de la reserva ${
              booking.id
            }')">Ver Detalles</button>
            ${
              booking.status === "upcoming"
                ? `
              <button class="btn btn-outline danger btn-sm" onclick="alert('Cancelar reserva ${booking.id}')">Cancelar</button>
              <button class="btn btn-primary btn-sm" onclick="alert('Modificar reserva ${booking.id}')">Modificar</button>
            `
                : ""
            }
            ${
              booking.status === "completed"
                ? `
              <button class="btn btn-outline btn-sm" onclick="alert('Dejar reseña para ${booking.id}')">Dejar Reseña</button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
    cont.appendChild(div);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// --- Logout ---
document
  .getElementById("logout-btn")
  .addEventListener("click", async function () {
    const logoutBtn = this;

    try {
      await withButtonLoader(
        logoutBtn,
        async () => {
          const result = await cerrarSesion();

          if (result.success) {
            showSuccessToast("Sesión cerrada exitosamente");
            // La función cerrarSesion ya maneja la redirección automáticamente
          } else {
            showErrorToast("Error al cerrar sesión");
          }

          return result;
        },
        "Cerrando sesión..."
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showErrorToast("Error al cerrar sesión");
    }
  });

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async function () {
  await cargarDatosUsuario();
  await cargarReservas();
});
