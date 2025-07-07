export function initRoomGallery(images) {
  const galleryContainer = document.getElementById("room-gallery");

  // Create gallery HTML
  let galleryHTML = `
    <div class="room-gallery-grid">
      <div class="room-gallery-main">
        <img src="${images[0] || "https://via.placeholder.com/800x600"}" 
             alt="Vista principal de la habitación" 
             class="room-gallery-img"
             onclick="openLightbox(0)">
      </div>
  `;

  // Add other images
  for (let i = 1; i < Math.min(images.length, 4); i++) {
    galleryHTML += `
      <div class="room-gallery-thumb">
        <img src="${images[i] || "https://via.placeholder.com/800x600"}" 
             alt="Vista de la habitación ${i}" 
             class="room-gallery-img"
             onclick="openLightbox(${i})">
      </div>
    `;
  }

  galleryHTML += "</div>";
  galleryContainer.innerHTML = galleryHTML;

  // Store images for lightbox
  window.roomImages = images;
}

// Lightbox functions
window.openLightbox = function (index) {
  const lightbox = document.getElementById("lightbox-modal");
  const lightboxImage = document.getElementById("lightbox-image");

  lightboxImage.src = window.roomImages[index];
  lightboxImage.alt = `Vista de la habitación ${index}`;
  window.currentImageIndex = index;

  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function () {
  const lightbox = document.getElementById("lightbox-modal");
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
};

window.nextImage = function () {
  const lightboxImage = document.getElementById("lightbox-image");
  window.currentImageIndex =
    (window.currentImageIndex + 1) % window.roomImages.length;
  lightboxImage.src = window.roomImages[window.currentImageIndex];
  lightboxImage.alt = `Vista de la habitación ${window.currentImageIndex}`;
};

window.prevImage = function () {
  const lightboxImage = document.getElementById("lightbox-image");
  window.currentImageIndex =
    (window.currentImageIndex - 1 + window.roomImages.length) %
    window.roomImages.length;
  lightboxImage.src = window.roomImages[window.currentImageIndex];
  lightboxImage.alt = `Vista de la habitación ${window.currentImageIndex}`;
};

// Add event listeners for lightbox controls
document.addEventListener("DOMContentLoaded", function () {
  // Lightbox controls
  document
    .getElementById("close-lightbox")
    .addEventListener("click", closeLightbox);
  document.getElementById("next-image").addEventListener("click", nextImage);
  document.getElementById("prev-image").addEventListener("click", prevImage);

  // Close lightbox when clicking outside the image
  const lightbox = document.getElementById("lightbox-modal");
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === this) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    const lightbox = document.getElementById("lightbox-modal");
    if (lightbox && lightbox.classList.contains("active")) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    }
  });
});
