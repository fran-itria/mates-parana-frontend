import { renderColors } from "../Services/renderColors.js";
import { renderTypes } from "../Services/renderTypes.js";
import { updateGalleryImage } from "../Services/updateGalleryImages.js";
import { detectColor } from "../Services/detectColor.js";
import { normalizeVarities } from "../Services/normalizeVarities.js";
import { colorMap } from "../Const/const.js"

export function renderProduct(
    p,
    selectedType,
    selectedColor,
    selectedVariant,
    galleryImages,
    currentImageIndex,
    onVariantChange
) {
    if (!p) return;

    document.getElementById("productName").textContent = p.name;

    // Precio base (transferencia)
    const transferPrice = p.discountedPrice ?? p.price;

    // Precio con tarjeta (+15%)
    const cardPrice = Math.round(transferPrice * 1.15);

    document.getElementById("transferPrice").textContent =
        "Precio con transferencia";

    document.getElementById("productPrice").textContent = `$${transferPrice.toLocaleString("es-AR")}`;

    const oldPriceEl = document.getElementById("oldPrice");
    if (p.discountedPrice) {
        oldPriceEl.textContent = `$${p.price.toLocaleString("es-AR")}`;
        oldPriceEl.style.display = "block";
    } else {
        oldPriceEl.style.display = "none";
    }

    document.getElementById("productDescription").innerText = p.description || "";
    document.getElementById("breadcrumbCategory").textContent = p.type || "";

    const thumbs = document.getElementById("galleryThumbs");
    const mainImage = document.getElementById("mainImage");

    thumbs.innerHTML = "";

    let images = [];

    if (Array.isArray(p.image) && p.image.length) {
        images = p.image.map((img) => img.replace(/\s/g, ""));
    } else {
        images = ["https://via.placeholder.com/400"];
    }

    galleryImages = images;
    currentImageIndex = 0;

    const visibleImages = galleryImages.slice(0, 4);

    // imagen inicial
    updateGalleryImage(0, galleryImages, currentImageIndex);

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
            const newIndex =
                (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;

            updateGalleryImage(newIndex);
        };

        nextBtn.onclick = () => {
            const newIndex = (currentImageIndex + 1) % galleryImages.length;

            updateGalleryImage(newIndex);
        };
    }

    // MEDIOS DE PAGO dinámico
    const paymentEl = document.getElementById("paymentInfo");

    if (paymentEl) {
        const cuotas = Math.round(cardPrice / 3);

        paymentEl.innerHTML = `
Precio con tarjeta: $${cardPrice.toLocaleString("es-AR")}<br>
3 x $${cuotas.toLocaleString("es-AR")} sin interés<br><br>

Precio con transferencia: $${transferPrice.toLocaleString("es-AR")}
`;
    }

    //informacion pago

    const cuotas = Math.round(cardPrice / 3);

    document.getElementById("installments").innerHTML = `Precio con tarjeta<br>
   $${cardPrice.toLocaleString("es-AR")}<br>
   3 x $${cuotas.toLocaleString("es-AR")} sin interés`;

    document.getElementById("shippingText").textContent =
        "Envío gratis superando los $80.000,00";

    //============ variantes de cada producto:
    const varities = normalizeVarities(p.varities || [], detectColor);

    const variantsContainer = document.getElementById("variants");

    if (variantsContainer && varities) {
        variantsContainer.innerHTML = "";

        // ✅ FUNCIÓN CORRECTA (UNA SOLA)
        function updateImageByVariant() {
            const match = varities.find((v) => v.color === selectedColor);

            if (match?.image) {
                const img = match.image.replace(/\s/g, "");

                const index = images.findIndex((i) => i === img);

                if (index !== -1) {
                    updateGalleryImage(index);
                } else {
                    document.getElementById("mainImage").src = img;
                }
            }
        }

        // ===== Tipos =====
        const availableTypes = [...new Set(varities.map((v) => v.type))];
        if (availableTypes.some(type => type !== null && type !== undefined && type !== "")) {
            const typeWrapper = document.createElement("div");
            variantsContainer.appendChild(typeWrapper);

            selectedType = availableTypes[0];
            const match = varities.find(
                (v) => v.type === selectedType
            );
            selectedVariant = match || null;
            onVariantChange(selectedColor, selectedType, selectedVariant);

            renderTypes(
                availableTypes,
                updateImageByVariant,
                typeWrapper,
                (type) => {
                    selectedType = type;

                    const match = varities.find(
                        (v) => v.type === selectedType
                    );

                    selectedVariant = match || null;

                    onVariantChange(selectedColor, selectedType, selectedVariant);

                    updateImageByVariant();
                }
            )
        }


        // ===== COLORES =====
        const availableColors = [...new Set(varities.map((v) => v.color))];
        if (availableColors.some(color => color !== null && color !== undefined && color !== "")) {
            const colorWrapper = document.createElement("div");
            variantsContainer.appendChild(colorWrapper);

            selectedColor = availableColors[0];
            const match = varities.find(
                (v) => v.color === selectedColor
            );
            selectedVariant = match || null;
            onVariantChange(selectedColor, selectedType, selectedVariant);

            renderColors(
                availableColors,
                updateImageByVariant,
                colorWrapper,
                colorMap,
                (color) => {
                    selectedColor = color;

                    const match = varities.find(
                        (v) => v.color === selectedColor
                    );

                    selectedVariant = match || null;

                    onVariantChange(selectedColor, selectedType, selectedVariant);

                    updateImageByVariant();
                }
            )
        }

        updateImageByVariant();
    }
}