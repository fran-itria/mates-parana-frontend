import { renderColors } from "../Services/renderColors.js";
import { renderTypes } from "../Services/renderTypes.js";
import { updateGalleryImage } from "../Services/updateGalleryImages.js";
import { detectColor } from "../Services/detectColor.js";
import { normalizeVarities } from "../Services/normalizeVarities.js";
import { renderDetailBase } from "../Services/renderDetailBase.js";
import { colorMap } from "../Const/const.js"

export function renderProduct(
    p,
    selectedType,
    selectedColor,
    selectedVariant,
    onVariantChange
) {
    if (!p) return;

    const images = renderDetailBase(p);

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
