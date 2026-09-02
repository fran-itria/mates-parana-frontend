export function updateGalleryImage(index, galleryImages, currentImageIndex) {
    if (!galleryImages.length) return;

    currentImageIndex = index;

    const mainImage = document.getElementById("mainImage");

    mainImage.classList.add("fade");

    setTimeout(() => {
        mainImage.src = galleryImages[currentImageIndex];

        document.querySelectorAll(".gallery-thumbs img").forEach((thumb, i) => {
            thumb.classList.toggle("active", i === currentImageIndex);
        });

        mainImage.classList.remove("fade");
    }, 150);
}