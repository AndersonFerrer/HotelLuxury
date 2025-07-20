// Manejo de rutas usando hash

const routes = {
  dashboard: {
    html: "pagesAdmin/dashboard.html",
    css: "styles/dashboardAdmin.css",
    script: "scripts/dashboardAdmin.js",
  },
  habitaciones: {
    html: "pagesAdmin/habitaciones.html",
    css: "styles/habitacionesAdmin.css",
    script: "scripts/habitacionesAdmin.js",
  },
  "tipos-caracteristicas": {
    html: "pagesAdmin/tiposcaracteristicas.html",
    css: "styles/tiposCaracteristicasAdmin.css",
    script: "scripts/tiposCaracteristicasAdmin.js",
  },
  pagos: {
    html: "pagesAdmin/pagos.html",
    //css: "styles/pagosAdmin.css",
  },
  empleados: {
    html: "pagesAdmin/empleados.html",
    //css: "styles/empleadosAdmin.css",
  },
  configuracion: {
    html: "pagesAdmin/configuracion.html",
    //css: "styles/configuracionAdmin.css",
  },
  clientes: {
    html: "pagesAdmin/huespedes.html",
    css: "styles/huespedesAdmin.css",
    script: "scripts/huespedesAdmin.js",
  },
  reservas: {
    html: "pagesAdmin/reservas.html",
    css: "styles/reservasAdmin.css",
    script: "scripts/reservasAdmin.js",
  },
};
async function router() {
  const hash = location.hash.slice(1) || "dashboard";
  const route = routes[hash];
  const container = document.getElementById("admin-content-container");

  if (!route) {
    container.innerHTML = "<p>Ruta no encontrada.</p>";
    return;
  }

  // Mostrar indicador de carga
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p style="color: #666;">Cargando ${hash}...</p>
      </div>
    </div>
  `;

  try {
    // 1. Cargar HTML
    const response = await fetch(route.html);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    container.innerHTML = html;

    // Actualizar título de la página
    document.getElementById("pageTitle").textContent =
      hash.slice(0, 1).toUpperCase() + hash.slice(1);

    // 2. Cargar CSS (si existe)
    if (route.css) {
      loadCSS(route.css);
    }

    // 3. Cargar Script JS (si existe)
    if (route.script) {
      try {
        await loadScriptAfterHTML(route.script); // Esperar a que el script se cargue
      } catch (err) {
        console.error("Error cargando el script:", err);
      }
    }
  } catch (error) {
    console.error("Error cargando la ruta:", error);
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <div style="text-align: center; color: #ef4444;">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Error al cargar la página</p>
          <p style="font-size: 0.9rem; color: #666;">${error.message}</p>
        </div>
      </div>
    `;
  }
}

function loadCSS(href) {
  // Quitar estilos anteriores
  const existingLink = document.getElementById("dynamic-css");
  if (existingLink) existingLink.remove();

  // Crear nuevo <link>
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.id = "dynamic-css";
  document.head.appendChild(link);
}

function loadScriptAfterHTML(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "module"; // si estás usando ES modules
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Escucha cambios en la URL
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
