// Función para obtener las estadísticas de las habitaciones
async function fetchRoomStats() {
  try {
    const response = await fetch("api/habitaciones/stats.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    updateDashboardStats(data);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  }
}

// Función para actualizar las estadísticas en el dashboard
function updateDashboardStats(data) {
  const { total, disponibles, ocupadas, mantenimiento, porcentaje_ocupacion } =
    data.data;
  document.getElementById("total-rooms").textContent = total || 0;
  document.getElementById("available-rooms").textContent = disponibles || 0;
  document.getElementById("occupied-rooms").textContent = ocupadas || 0;
  document.getElementById("maintenance-rooms").textContent = mantenimiento || 0;
  document.getElementById("occupancy-rate").textContent = `${
    porcentaje_ocupacion || 0
  }%`;
}

// Cargar estadísticas cuando se carga la página
document.addEventListener("DOMContentLoaded", fetchRoomStats);
