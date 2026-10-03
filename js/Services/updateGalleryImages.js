let galleryImages = [];
let currentImageIndex = 0;
// Última foto pedida con showImage (null si se volvió a la galería)
let lastShownSrc = null;

export function setGalleryImages(images = []) {
  galleryImages = images;
  currentImageIndex = 0;
}

export function getGalleryImages() {
  return galleryImages;
}

export function getCurrentImageIndex() {
  return currentImageIndex;
}

export function updateGalleryImage(index) {
  if (!galleryImages.length) return;

  currentImageIndex = index;
  lastShownSrc = null;

  const mainImage = document.getElementById("mainImage");

  if (!mainImage) return;

  mainImage.classList.add("fade");

  setTimeout(() => {
    mainImage.src = galleryImages[currentImageIndex];

    document.querySelectorAll(".gallery-thumbs img").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === currentImageIndex);
    });

    mainImage.classList.remove("fade");
  }, 150);
}

// Fotos ya pedidas, para no descargarlas dos veces
const preloaded = new Map();

function loadImage(src) {
  if (!preloaded.has(src)) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    preloaded.set(src, img.decode().catch(() => {}));
  }

  return preloaded.get(src);
}

// Con ahorro de datos o conexión lenta no se precarga nada
function canPreload() {
  const connection = navigator.connection;

  if (!connection) return true;

  return !connection.saveData && !/2g|3g/.test(connection.effectiveType || "");
}

// Descarga las fotos en segundo plano, de a una para no competir con el
// resto de la página, así después el cambio es inmediato
export async function preloadImages(srcs = []) {
  if (!canPreload()) return;

  for (const src of [...new Set(srcs)]) {
    if (src) await loadImage(src);
  }
}

// Muestra en la imagen principal una foto que no es de la galería (por
// ejemplo, la de una variante elegida en una promo). Las miniaturas quedan
// sin marcar y las flechas siguen desde la foto de la galería actual.
export async function showImage(src) {
  const mainImage = document.getElementById("mainImage");

  if (!mainImage || !src) return;

  lastShownSrc = src;

  mainImage.classList.add("fade");

  // Se espera a que la foto esté descargada antes de cambiarla
  await loadImage(src);

  // Si mientras tanto se eligió otra variante, se descarta esta
  if (lastShownSrc !== src) return;

  mainImage.src = src;

  document.querySelectorAll(".gallery-thumbs img").forEach((thumb) => {
    thumb.classList.remove("active");
  });

  mainImage.classList.remove("fade");
}
