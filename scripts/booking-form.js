import {
  withButtonLoader,
  withLoadingModal,
  showSuccessToast,
  showErrorToast,
} from "./loaderUtils.js";

export function initBookingForm(roomId, roomPrice, idTipoHabitacion) {
  const formContainer = document.getElementById("booking-form");

  // Create date picker input
  const today = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(today.getDate() + 3);

  // Format dates for display
  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("es-ES", options);
  };

  // Initial state
  let startDate = today;
  let endDate = defaultEndDate;
  let adults = 2;
  let children = 0;
  let habitacionesDisponibles = [];
  let habitacionSeleccionada = null;

  // Cargar habitaciones disponibles del tipo seleccionado
  async function cargarHabitacionesDisponibles() {
    try {
      const response = await fetch(
        `/api/habitaciones/getByTipo.php?tipo=${idTipoHabitacion}`
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        habitacionesDisponibles = data.data;
        actualizarSelectHabitaciones();
      } else {
        showErrorToast("No hay habitaciones disponibles de este tipo");
        return false;
      }
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
      showErrorToast("Error al cargar habitaciones disponibles");
      return false;
    }
    return true;
  }

  function actualizarSelectHabitaciones() {
    const habitacionSelect = document.getElementById("habitacion-select");
    if (habitacionSelect) {
      habitacionSelect.innerHTML =
        '<option value="">Seleccionar habitación</option>';
      habitacionesDisponibles.forEach((habitacion) => {
        const option = document.createElement("option");
        option.value = habitacion.id_habitacion;
        option.textContent = `Habitación #${habitacion.numero}`;
        habitacionSelect.appendChild(option);
      });
    }
  }

  // Create form HTML
  formContainer.innerHTML = `
    <div class="booking-form">
      <div class="form-space">
        <!-- Habitación -->
        <div class="form-group">
          <label class="form-label">Habitación</label>
          <select id="habitacion-select" class="form-input" required>
            <option value="">Cargando habitaciones...</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="form-group">
          <label class="form-label">Fechas de estancia</label>
          <button id="date-range-button" class="date-range-btn">
            <i class="fas fa-calendar-alt calendar-icon"></i>
            <span id="date-range-display">${formatDate(
              startDate
            )} - ${formatDate(endDate)}</span>
          </button>
          <div id="date-picker-container" class="date-picker-container">
            <div class="calendar-header">
              <button id="prev-month" class="month-nav-btn"><i class="fas fa-chevron-left"></i></button>
              <h3 id="current-month" class="current-month"></h3>
              <button id="next-month" class="month-nav-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div id="calendar" class="calendar-grid"></div>
          </div>
        </div>

        <!-- Guests -->
        <div class="guests-grid">
          <div class="guest-select">
            <label class="form-label">Adultos</label>
            <select id="adults-select" class="guest-select-input">
              <option value="1">1</option>
              <option value="2" selected>2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div class="guest-select">
            <label class="form-label">Niños</label>
            <select id="children-select" class="guest-select-input">
              <option value="0" selected>0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="price-summary">
        <div class="price-row">
          <span class="price-label">
            S/. ${roomPrice} x <span id="nights">3</span> noches
          </span>
          <span id="subtotal" class="price-value">S/. ${roomPrice * 3}</span>
        </div>
        <div class="price-row">
          <span class="price-label">Impuestos (18%)</span>
          <span id="taxes" class="price-value">S/. ${Math.round(
            roomPrice * 3 * 0.18
          )}</span>
        </div>
        <div class="price-row total-row">
          <span>Total</span>
          <span id="total-price">S/. ${Math.round(roomPrice * 3 * 1.18)}</span>
        </div>
      </div>

      <!-- Book Button -->
      <button id="book-button" class="book-btn">
        Reservar Ahora
      </button>

      <p class="disclaimer-text">No se te cobrará nada por ahora</p>
    </div>
  `;

  // Cargar habitaciones al inicializar
  cargarHabitacionesDisponibles().then((success) => {
    if (!success) {
      document.getElementById("book-button").disabled = true;
    }
  });

  // Event listener para selección de habitación
  const habitacionSelect = document.getElementById("habitacion-select");
  if (habitacionSelect) {
    habitacionSelect.addEventListener("change", (e) => {
      habitacionSeleccionada = e.target.value;
    });
  }

  // Calendar functionality
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  const renderCalendar = () => {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;

    calendar.innerHTML = "";

    // Header with day names
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    dayNames.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day-header";
      dayElement.textContent = day;
      calendar.appendChild(dayElement);
    });

    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      calendar.appendChild(emptyCell);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayElement = document.createElement("button");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;

      // Disable dates before today
      if (
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ) {
        dayElement.classList.add("disabled");
        dayElement.disabled = true;
      } else {
        // Highlight selected range
        if (startDate && endDate && date >= startDate && date <= endDate) {
          dayElement.classList.add("selected");
        } else if (
          date.getTime() === startDate?.getTime() ||
          date.getTime() === endDate?.getTime()
        ) {
          dayElement.classList.add("selected");
        }

        dayElement.addEventListener("click", () => {
          if (!startDate || (startDate && endDate)) {
            // Start new selection
            startDate = date;
            endDate = null;
          } else if (date > startDate) {
            // Complete selection
            endDate = date;
            updateDateDisplay();
            updatePriceDisplay();
          } else if (date < startDate) {
            // Reset selection
            startDate = date;
            endDate = null;
          }

          renderCalendar();
        });
      }

      calendar.appendChild(dayElement);
    }

    // Update month display
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const currentMonthElement = document.getElementById("current-month");
    if (currentMonthElement) {
      currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
  };

  // Update date range display
  const updateDateDisplay = () => {
    const dateRangeDisplay = document.getElementById("date-range-display");
    if (dateRangeDisplay) {
      if (startDate && endDate) {
        dateRangeDisplay.textContent = `${formatDate(startDate)} - ${formatDate(
          endDate
        )}`;
      } else if (startDate) {
        dateRangeDisplay.textContent = `${formatDate(
          startDate
        )} - Seleccionar fecha final`;
      }
    }
  };

  // Calculate and update price display
  const updatePriceDisplay = () => {
    if (!startDate || !endDate) return;

    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const subtotal = nights * roomPrice;
    const taxes = Math.round(subtotal * 0.18);
    const total = subtotal + taxes;

    const nightsElement = document.getElementById("nights");
    const subtotalElement = document.getElementById("subtotal");
    const taxesElement = document.getElementById("taxes");
    const totalElement = document.getElementById("total-price");

    if (nightsElement) nightsElement.textContent = nights;
    if (subtotalElement) subtotalElement.textContent = `S/. ${subtotal}`;
    if (taxesElement) taxesElement.textContent = `S/. ${taxes}`;
    if (totalElement) totalElement.textContent = `S/. ${total}`;
  };

  // Toggle calendar visibility
  const dateRangeButton = document.getElementById("date-range-button");
  if (dateRangeButton) {
    dateRangeButton.addEventListener("click", (e) => {
      e.preventDefault();
      const picker = document.getElementById("date-picker-container");
      if (picker) {
        picker.classList.toggle("visible");
      }
    });
  }

  // Month navigation
  const prevMonthBtn = document.getElementById("prev-month");
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
  }

  const nextMonthBtn = document.getElementById("next-month");
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
  }

  // Guests selection
  const adultsSelect = document.getElementById("adults-select");
  if (adultsSelect) {
    adultsSelect.addEventListener("change", (e) => {
      adults = parseInt(e.target.value);
    });
  }

  const childrenSelect = document.getElementById("children-select");
  if (childrenSelect) {
    childrenSelect.addEventListener("change", (e) => {
      children = parseInt(e.target.value);
    });
  }

  // Book button
  const bookButton = document.getElementById("book-button");
  if (bookButton) {
    bookButton.addEventListener("click", async () => {
      if (!startDate || !endDate) {
        showErrorToast("Por favor selecciona las fechas de tu estancia");
        return;
      }

      if (!habitacionSeleccionada) {
        showErrorToast("Por favor selecciona una habitación");
        return;
      }

      try {
        await withButtonLoader(
          bookButton,
          async () => {
            // Verificar autenticación antes de proceder
            const authResponse = await fetch("/api/auth/check-session.php");
            const authData = await authResponse.json();

            if (!authData.success || !authData.usuario) {
              showErrorToast("Debes iniciar sesión para realizar una reserva");
              setTimeout(() => {
                window.location.href = "/auth.html";
              }, 2000);
              return;
            }

            if (authData.usuario.tipo !== "cliente") {
              showErrorToast("Solo los clientes pueden realizar reservas");
              setTimeout(() => {
                if (authData.usuario.tipo === "empleado") {
                  window.location.href = "/admin-page.html";
                } else {
                  window.location.href = "/auth.html";
                }
              }, 2000);
              return;
            }

            // Si está autenticado como cliente, proceder con la reserva
            const reservaData = {
              id_habitacion: habitacionSeleccionada,
              fecha_checkin: startDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
              fecha_checkout: endDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
              total: Math.round(
                roomPrice *
                  Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) *
                  1.18
              ), // Precio con impuestos
            };

            const response = await fetch("/api/reservas/insert.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reservaData),
            });

            const result = await response.json();

            if (result.success) {
              showSuccessToast(
                `¡Reserva creada exitosamente!\n\nDetalles:\n- Habitación: ${result.data.habitacion}\n- Check-in: ${result.data.fecha_checkin}\n- Check-out: ${result.data.fecha_checkout}\n- Total: S/. ${result.data.total}\n\nID de reserva: ${result.data.id_reserva}`
              );
              // Opcional: redirigir a una página de confirmación o al home
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
            } else {
              showErrorToast("Error al crear la reserva: " + result.error);
            }

            return result;
          },
          "Procesando reserva..."
        );
      } catch (error) {
        console.error("Error:", error);
        showErrorToast(
          "Error al procesar la reserva. Por favor, intenta nuevamente."
        );
      }
    });
  }

  // Close calendar when clicking outside
  document.addEventListener("click", (e) => {
    const datePicker = document.getElementById("date-picker-container");
    const dateButton = document.getElementById("date-range-button");

    if (
      datePicker &&
      dateButton &&
      !datePicker.contains(e.target) &&
      !dateButton.contains(e.target)
    ) {
      datePicker.classList.remove("visible");
    }
  });

  // Initial render
  renderCalendar();
  updatePriceDisplay();
}
