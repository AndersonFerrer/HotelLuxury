// Manejo de rutas usando hash

const routes = {
  dashboard: {
    html: "pagesAdmin/dashboard.html",
    css: "styles/dashboardAdmin.css",
  },
  habitaciones: {
    html: "pagesAdmin/habitaciones.html",
    css: "styles/habitacionesAdmin.css",
    script: "scripts/habitacionesAdmin.js",
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
    html: "pagesAdmin/clientes.html",
    //css: "styles/clientesAdmin.css",
  },
  reservas: {
    html: "pagesAdmin/reservas.html",
    //css: "styles/reservasAdmin.css",
  },
};
async function router() {
  const hash = location.hash.slice(1) || "dashboard";
  const route = routes[hash];

  if (!route) {
    document.getElementById("admin-content-container").innerHTML =
      "<p>Ruta no encontrada.</p>";
    return;
  }

  // 1. Cargar HTML
  const html = await fetch(route.html).then((res) => res.text());
  document.getElementById("admin-content-container").innerHTML = html;
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
