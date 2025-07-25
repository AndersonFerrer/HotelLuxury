/**
 * Clase para gestionar el sidebar de la aplicación admin
 */
export class SidebarManager {
  constructor() {
    this.adminSidebar = null;
    this.mainContent = document.querySelector(".admin-main-content");
    this.overlay = document.querySelector(".admin-sidebar-overlay");
    this.menuToggle = document.getElementById("menuToggle");
    this.MOBILE_BREAKPOINT = 768;
    this.DEFAULT_HASH = "#dashboard";
  }

  /**
   * Inicializa el sidebar con el elemento DOM proporcionado
   * @param {HTMLElement} sidebarElement - El elemento del sidebar
   */
  initialize(sidebarElement) {
    this.adminSidebar = sidebarElement;
    this.setupEventListeners();
    this.updateActiveLink();
  }

  /**
   * Configura todos los event listeners necesarios
   */
  setupEventListeners() {
    // Configurar evento de cambio de hash
    window.addEventListener("hashchange", () => this.updateActiveLink());

    // Configurar eventos de navegación
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => this.handleNavLinkClick(e, link));
    });

    // Configurar toggle del menú
    if (this.menuToggle) {
      this.menuToggle.addEventListener("click", () => this.toggleSidebar());
    }

    // Configurar overlay
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.closeSidebar());
    }
    
    // Manejar cambios de tamaño de ventana
    window.addEventListener("resize", this.debounce(() => {
      if (window.innerWidth > this.MOBILE_BREAKPOINT && 
          this.adminSidebar?.classList.contains("mobile-open")) {
        this.closeSidebar();
      }
    }, 150));
  }

  /**
   * Actualiza el enlace activo basado en el hash actual
   */
  updateActiveLink() {
    const navLinks = document.querySelectorAll(".nav-link");
    const currentHash = window.location.hash || this.DEFAULT_HASH;

    navLinks.forEach(link => {
      const linkHash = "#" + (link.getAttribute("href").split("#")[1] || "dashboard");
      link.classList.toggle("active", linkHash === currentHash);
    });
  }

  /**
   * Maneja el clic en los enlaces de navegación
   * @param {Event} e - El evento de clic
   * @param {HTMLElement} link - El enlace que fue clickeado
   */
  handleNavLinkClick(e, link) {
    if (link.getAttribute("href").includes("#")) {
      e.preventDefault();
      const newHash = link.getAttribute("href").split("#")[1];
      window.location.hash = newHash || "dashboard";
    }

    if (window.innerWidth <= this.MOBILE_BREAKPOINT) {
      this.closeSidebar();
    }
  }

  /**
   * Alterna la visibilidad del sidebar
   */
  toggleSidebar() {
    if (this.adminSidebar) {
      this.adminSidebar.classList.toggle("mobile-open");
      this.overlay?.classList.toggle("visible");
      document.body.style.overflow = this.adminSidebar.classList.contains("mobile-open") 
        ? "hidden" 
        : "";
    }
  }

  /**
   * Cierra el sidebar
   */
  closeSidebar() {
    if (this.adminSidebar) {
      this.adminSidebar.classList.remove("mobile-open");
      this.overlay?.classList.remove("visible");
      document.body.style.overflow = "";
      this.mainContent?.classList.remove("sidebar-open");
    }
  }
  
  /**
   * Función de utilidad para limitar la frecuencia de ejecución de funciones
   * @param {Function} func - La función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} - Función con debounce aplicado
   */
  debounce(func, wait = 100) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}