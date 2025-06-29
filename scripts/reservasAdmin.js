async function fetchReservasStats() {
  try {
    const response = await fetch("api/reservas/getAll.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    updateStatsUI(data);
    updateTableUI(data.reservas);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  }
}

await fetchReservasStats();

function updateStatsUI(stats) {
  console.log(stats);
  document.getElementById("total-reservas").textContent = stats.total_reservas;
  document.getElementById("reservas-confirmadas").textContent =
    stats.total_confirmadas;
  document.getElementById("reservas-pendientes").textContent =
    stats.total_pendientes;
  document.getElementById(
    "ingresos-totales-reservas"
  ).textContent = `S/. ${stats.total_ingresos}`;
}

function updateTableUI(data) {
  const tableBody = document.getElementById("table-reservas");
  console.log(data);
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

    const row = `  <tr>
          <td>${reserva.id}</td>
          <td>${reserva.huesped}</td>
          <td>${reserva.habitacion}</td>
          <td>${reserva.checkin}</td>
          <td>${reserva.checkout}</td>
          <td><span class="status-badge ${getStatus(reserva.estado)}">${
      reserva.estado
    }</span></td>
          <td>S/. ${reserva.total}</td>
          <td class="acciones">
            <button class="action-btn info" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn warning" title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button class="action-btn danger" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr> `;
    tableBody.innerHTML += row;
  });
}

window.addEventListener("hashchange", async () => {
  const hash = location.hash.slice(1) || "dashboard";
  if (hash === "reservas") {
    await fetchReservasStats();
  }
});
