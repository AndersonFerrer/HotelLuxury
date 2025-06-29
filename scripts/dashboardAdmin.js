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

await fetchDashboardStats();

function updateDashboardUI(stats) {
  console.log(stats);
  document.getElementById("total-reservas").textContent =
    stats.reservas_totales;
  document.getElementById(
    "ingresos-totales"
  ).textContent = `S/. ${stats.ingresos_totales}`;
  document.getElementById(
    "tasa-ocupacion-dashboard"
  ).textContent = `${stats.tasa_ocupacion}%`;
  document.getElementById("nuevos-clientes").textContent =
    stats.nuevos_clientes;
}

function updateTableUI(data) {
  const tableBody = document.getElementById("table-reservas-dashboard");
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

window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "dashboard") {
    await fetchDashboardStats();
  }
});
