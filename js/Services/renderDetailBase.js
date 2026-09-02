import {
    setGalleryImages,
    updateGalleryImage,
    getGalleryImages,
    getCurrentImageIndex,
} from "./updateGalleryImages.js";

/**
 * Renderiza la parte común de la ficha de detalle (nombre, precios, galería,
 * medios de pago y envío), tanto para un producto como para un combo.
 *
 * Devuelve el listado de imágenes ya normalizado.
 */
export function renderDetailBase(item) {
    if (!item) return [];

    document.getElementById("productName").textContent = item.name || "";

    // Precio base (transferencia)
    const transferPrice = item.discountedPrice ?? item.price;

    // Precio con tarjeta (+15%)
    const cardPrice = Math.round(transferPrice * 1.15);

    document.getElementById("transferPrice").textContent =
        "Precio con transferencia";

    document.getElementById("productPrice").textContent = `$${transferPrice.toLocaleString("es-AR")}`;

    const oldPriceEl = document.getElementById("oldPrice");
    if (item.discountedPrice) {
        oldPriceEl.textContent = `$${item.price.toLocaleString("es-AR")}`;
        oldPriceEl.style.display = "block";
    } else {
        oldPriceEl.style.display = "none";
    }

    document.getElementById("productDescription").innerText = item.description || "";
    document.getElementById("breadcrumbCategory").textContent = item.type || "";

    const thumbs = document.getElementById("galleryThumbs");

    thumbs.innerHTML = "";

    let images = [];

    if (Array.isArray(item.image) && item.image.length) {
        images = item.image.map((img) => img.replace(/\s/g, ""));
    } else {
        images = ["https://via.placeholder.com/400"];
    }

    setGalleryImages(images);

    const visibleImages = images.slice(0, 4);

    // imagen inicial
    updateGalleryImage(0);

    // thumbs
    visibleImages.forEach((img, index) => {
        const thumb = document.createElement("img");
        thumb.src = img;

        if (index === 0) thumb.classList.add("active");

        thumb.addEventListener("click", () => {
            updateGalleryImage(index);
        });

        thumbs.appendChild(thumb);
    });

    // ===== FLECHAS =====
    const prevBtn = document.getElementById("prevImg");
    const nextBtn = document.getElementById("nextImg");

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => {
            const gallery = getGalleryImages();

            const newIndex =
                (getCurrentImageIndex() - 1 + gallery.length) % gallery.length;

            updateGalleryImage(newIndex);
        };

        nextBtn.onclick = () => {
            const gallery = getGalleryImages();

            const newIndex = (getCurrentImageIndex() + 1) % gallery.length;

            updateGalleryImage(newIndex);
        };
    }

    // MEDIOS DE PAGO dinámico
    const cuotas = Math.round(cardPrice / 3);

    const paymentEl = document.getElementById("paymentInfo");
    if (paymentEl) {
        paymentEl.innerHTML = `
Precio con tarjeta: $${cardPrice.toLocaleString("es-AR")}<br>
3 x $${cuotas.toLocaleString("es-AR")} sin interés<br><br>

Precio con transferencia: $${transferPrice.toLocaleString("es-AR")}
`;
    }

    //informacion pago
    document.getElementById("installments").innerHTML = `Precio con tarjeta<br>
   $${cardPrice.toLocaleString("es-AR")}<br>
   3 x $${cuotas.toLocaleString("es-AR")} sin interés`;

    document.getElementById("shippingText").textContent =
        "Envío gratis superando los $80.000,00";

    return images;
}
