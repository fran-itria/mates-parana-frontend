const imagenesMayorista = document.querySelectorAll(
  ".galeria-info-mayorista img"
);

const lightboxMayorista = document.getElementById("lightbox-mayorista");

const lightboxImgMayorista = document.getElementById("lightbox-img-mayorista");

const cerrarMayorista = document.querySelector(".cerrar-mayorista");

// Abrir imagen
imagenesMayorista.forEach((imagen) => {
  imagen.addEventListener("click", () => {
    lightboxMayorista.classList.add("active");

    lightboxImgMayorista.src = imagen.src;
  });
});

// Cerrar con X
cerrarMayorista.addEventListener("click", () => {
  lightboxMayorista.classList.remove("active");
});

// Cerrar haciendo click afuera
lightboxMayorista.addEventListener("click", (e) => {
  if (e.target === lightboxMayorista) {
    lightboxMayorista.classList.remove("active");
  }
});

// Cerrar con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightboxMayorista.classList.remove("active");
  }
});
