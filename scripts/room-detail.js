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
        initBookingForm(roomId, tipo_habitacion.precio_noche);
      } else {
        console.error("Habitación no encontrada");
      }
    } else {
      console.error("Error del servidor:", data.error);
    }
  } catch (error) {
    console.error("Error al obtener detalles de habitación:", error);
  }
});

function updateRoomDetails(roomData) {
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
  const caracteristicas = roomData.caracteristicas.split(", ");
  caracteristicas.forEach((feature) => {
    const featureElement = document.createElement("div");
    featureElement.className = "flex items-center";
    featureElement.innerHTML = `
    <i class="fas fa-check text-[#d4af37] mr-2"></i>
    <span class="text-gray-600">${feature}</span>
  `;
    featuresContainer.appendChild(featureElement);
  });
}
