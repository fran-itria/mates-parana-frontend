import { renderColors } from "../Services/renderColors.js";
import { updateGalleryImage } from "../Services/updateGalleryImages.js";

export function renderProduct(
    p,
    allProducts,
    currentProduct,
    selectedType,
    selectedColor,
    selectedVariant,
    galleryImages,
    currentImageIndex
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

    function detectColor(text = "") {
        text = text.toLowerCase();

        const colors = {
            negro: ["negro"],

            blanco: ["blanco"],

            rojo: ["rojo"],

            rojoOscuro: ["rojo oscuro"],

            rosa: ["rosa", "pink"],

            marron: ["marron", "marrón"],

            marronClaro: ["marron claro", "marrón claro"],

            marronOscuro: ["marron oscuro", "marrón oscuro"],

            beige: ["beige", "nude"],

            verde: ["verde"],

            azul: ["azul"],

            amarillo: ["amarillo"],

            violeta: ["violeta", "lila"],

            gris: ["gris"],

            chocolate: ["chocolate", "marronoscuro"],

            borravino: ["bordo", "borra vino", "borravino", "vino"],
        };

        for (const [key, aliases] of Object.entries(colors)) {
            if (aliases.some((alias) => text.includes(alias))) {
                return key;
            }
        }

        return null;
    }

    function normalizeVarities(varities) {
        return varities.map((v) => ({
            ...v,

            color: detectColor(
                `${v.color || ""} ${v.name || ""} ${v.description || ""}`
            ),
        }));
    }

    const varities = normalizeVarities(p.varities || []);

    const variantsContainer = document.getElementById("variants");

    if (variantsContainer && varities) {
        variantsContainer.innerHTML = "";

        // ✅ FUNCIÓN CORRECTA (UNA SOLA)
        function updateImageByVariant() {
            const match = varities.find((v) => v.color === selectedColor);

            selectedVariant = match || null;

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

        // ===== COLORES =====

        const colorWrapper = document.createElement("div");

        const colorMap = {
            negro: "#000",
            blanco: "#fff",
            rojo: "#c00",
            rojoOscuro: "rgb(112, 7, 7)",
            rosa: "rgb(233, 152, 152)",
            verde: "#477e4c",
            azul: "#34449b",
            amarillo: "#ffd23d",
            violeta: "#773dff",
            gris: "#757575",
            marron: "#553321",
            chocolate: "#4d2e1e",
            marronclaro: "#e08f64",
            marronoscuro: "#442617",
            borravino: "#5e2231",
            beige: "#d2b48c",
        };

        const availableColors = [...new Set(varities.map((v) => v.color))];
        variantsContainer.appendChild(colorWrapper);
        // selectedColor = availableColors[0];
        renderColors(
            varities,
            updateImageByVariant,
            colorWrapper,
            selectedColor,
            colorMap
        )

        updateImageByVariant();
    }
}