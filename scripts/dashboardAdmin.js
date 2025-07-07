async function fetchDashboardStats() {
  try {
    const response = await fetch("api/dashboard/dashboardStats.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    updateDashboardUI(data);
    updateTableUI(data.reservas_recientes);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  }
}

function updateDashboardUI(stats) {
  console.log(stats);

  // Verificar que los elementos existen antes de intentar acceder a ellos
  const totalReservas = document.getElementById("total-reservas");
  const ingresosTotales = document.getElementById("ingresos-totales");
  const tasaOcupacion = document.getElementById("tasa-ocupacion-dashboard");
  const nuevosClientes = document.getElementById("nuevos-clientes");

  if (totalReservas) totalReservas.textContent = stats.reservas_totales;
  if (ingresosTotales)
    ingresosTotales.textContent = `S/. ${stats.ingresos_totales}`;
  if (tasaOcupacion) tasaOcupacion.textContent = `${stats.tasa_ocupacion}%`;
  if (nuevosClientes) nuevosClientes.textContent = stats.nuevos_clientes;
}

function updateTableUI(data) {
  const tableBody = document.getElementById("table-reservas-dashboard");
  if (!tableBody) return; // Si no existe la tabla, salir

  if (data.length === 0) {
    return (tableBody.innerText = "No hay reservas recientes");
  }

  tableBody.innerHTML = "";
  data.forEach((reserva) => {
    const getStatus = (estado) => {
      switch (estado) {
        case "Confirmada":
          return "success";
        case "Cancelada":
          return "danger";
        case "Pendiente":
          return "warning";
        default:
          return "info";
      }
    };

    const row = `
           <tr>
          <td>${reserva.id}</td>
          <td>${reserva.huesped}</td>
          <td>${reserva.habitacion}</td>
          <td>${reserva.checkin}</td>
          <td>${reserva.checkout}</td>
          <td><span class="status-badge ${getStatus(reserva.estado)}">${
      reserva.estado
    }</span></td>
          <td>S/. ${reserva.total}</td>
        </tr>
        `;
    tableBody.innerHTML += row;
  });
}

// Solo ejecutar si estamos en la página del dashboard
function initDashboard() {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "dashboard") {
    fetchDashboardStats();
  }
}

// Ejecutar al cargar la página
initDashboard();

window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "dashboard") {
    await fetchDashboardStats();
  }
});
