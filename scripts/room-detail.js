import { initRoomGallery } from "./room-gallery.js";
import { initBookingForm } from "./booking-form.js";

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id") || "1";

  try {
    const response = await fetch("api/habitaciones/detalle.php?id=" + roomId);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      const tipo_habitacion = data.data;
      if (tipo_habitacion) {
        updateRoomDetails(tipo_habitacion);
        initRoomGallery(tipo_habitacion.imagenes || []);
        initBookingForm(
          roomId,
          tipo_habitacion.precio_noche,
          tipo_habitacion.id_tipo_habitacion
        );
      } else {
        console.error("Habitación no encontrada");
        alert("El tipo de habitación no existe");
        window.location.href = "/";
      }
    } else {
      console.error("Error del servidor:", data.error);
      alert("El tipo de habitación no existe o no está disponible");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error al obtener detalles de habitación:", error);
    alert(
      "Ocurrió un error al cargar los detalles de la habitación posiblemente no exista"
    );
    window.location.href = "/";
  }
});

function updateRoomDetails(roomData) {
  console.log(roomData);
  document.getElementById("room-name").textContent =
    "Habitación " + roomData.nombre;
  document.getElementById("room-description").textContent =
    roomData.descripcion;
  document.getElementById("room-price").textContent =
    "S/. " + roomData.precio_noche;
  document.getElementById("bed-type").textContent =
    roomData.habitaciones_disponibles + " habitaciones disponibles";
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
