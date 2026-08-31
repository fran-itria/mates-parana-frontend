const imagenes = document.querySelectorAll(".galeria-regalos img");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const cerrar = document.querySelector(".cerrar");

imagenes.forEach((imagen) => {
  imagen.addEventListener("click", () => {
    lightbox.classList.add("active");
    lightboxImg.src = imagen.src;
  });
});

cerrar.addEventListener("click", () => {
  lightbox.classList.remove("active");
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove("active");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.classList.remove("active");
  }
});
