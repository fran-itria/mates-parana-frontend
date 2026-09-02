let galleryImages = [];
let currentImageIndex = 0;

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
