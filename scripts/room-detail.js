import { initRoomGallery } from "./room-gallery.js";
import { initBookingForm } from "./booking-form.js";

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const tipoId = urlParams.get("id") || "1";

  try {
    // Obtener detalle del tipo de habitación y habitaciones disponibles
    const response = await fetch(
      `api/habitaciones/detalle_tipo.php?id_tipo=${tipoId}`
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "No existe el tipo de habitación");
    }
    const tipoDetalle = data.data.tipo;
    const habitacionesDisponibles = data.data.habitaciones_disponibles || [];
    // Render detalle y habitaciones disponibles
    updateRoomDetails({
      ...tipoDetalle,
      habitaciones_disponibles: habitacionesDisponibles.length,
    });
    renderHabitacionesDisponibles(habitacionesDisponibles);
    initRoomGallery(tipoDetalle.imagenes || []);
    initBookingForm(
      null, // No hay roomId específico, solo tipo
      tipoDetalle.precio_noche,
      tipoDetalle.id_tipo_habitacion
    );
  } catch (error) {
    console.error("Error al obtener detalles de tipo de habitación:", error);
    alert(
      "Ocurrió un error al cargar los detalles del tipo de habitación, posiblemente no exista"
    );
    window.location.href = "/";
  }
});

function renderHabitacionesDisponibles(habitaciones) {
  const container = document.getElementById("room-available-list");
  if (!container) return;
  container.innerHTML = "";
  if (habitaciones.length === 0) {
    container.innerHTML =
      '<span class="text-red-600">No hay habitaciones disponibles para este tipo.</span>';
    return;
  }
  habitaciones.forEach((hab) => {
    const div = document.createElement("div");
    div.className = "habitacion-disponible-item";
    div.innerHTML = `<i class='fas fa-bed text-[#d4af37] mr-2'></i> Habitación N° <b>${hab.numero}</b>`;
    container.appendChild(div);
  });
}

function updateRoomDetails(roomData) {
  console.log(roomData);
  document.getElementById("room-name").textContent =
    "Habitación " + roomData.nombre;
  document.getElementById("room-description").textContent =
    roomData.descripcion;
  document.getElementById("room-price").textContent =
    "S/. " + roomData.precio_noche;
  document.getElementById("bed-type").textContent =
    (typeof roomData.habitaciones_disponibles === "number"
      ? roomData.habitaciones_disponibles
      : 0) + " habitaciones disponibles";
  document.getElementById("room-capacity").textContent =
    roomData.aforo + " Personas aforo";

  const featuresContainer = document.getElementById("room-features");
  featuresContainer.innerHTML = "";
  if (roomData.caracteristicas) {
    const caracteristicas = roomData.caracteristicas;
    caracteristicas.forEach((feature) => {
      const featureElement = document.createElement("div");
      featureElement.className = "flex items-center";
      featureElement.innerHTML = `
    <i class="fas fa-check text-[#d4af37] mr-2"></i>
    <span class="text-gray-600">${feature}</span>
  `;
      featuresContainer.appendChild(featureElement);
    });
  } else {
    featuresContainer.innerText = "No hay características";
  }
}
