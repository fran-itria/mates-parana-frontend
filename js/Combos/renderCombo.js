import { renderColors } from "../Services/renderColors.js";
import { renderTypes } from "../Services/renderTypes.js";
import { updateGalleryImage } from "../Services/updateGalleryImages.js";
import { detectColor } from "../Services/detectColor.js";
import { renderDetailBase } from "../Services/renderDetailBase.js";
import { colorMap } from "../Const/const.js"

/**
 * Normaliza las variedades de un producto del combo conservando el valor
 * original del color (el que espera el backend) además de la clave
 * normalizada que se usa para pintar el círculo de color.
 */
function normalizeComboVarities(varities = []) {
    return varities.map((v) => {
        const rawColor = v.color || null;

        const detected = detectColor(
            `${v.color || ""} ${v.name || ""} ${v.description || ""}`
        );

        return {
            ...v,
            rawColor,
            color: detected || rawColor,
            type: v.type || null,
        };
    });
}

/**
 * Devuelve las variedades elegibles de un producto del combo según los
 * límites que venga en su elemento de defaultSelected.
 *
 * - limitColors / limitTypes: filtran las variedades del producto.
 * - sin límites: se puede elegir cualquier variedad del producto.
 */
function getSelectableVarities(item, product) {
    const varities = normalizeComboVarities(product?.varities || []);

    const limitColors = (item.limitColors || []).map((c) => String(c).toLowerCase());
    const limitTypes = (item.limitTypes || []).map((t) => String(t).toLowerCase());

    let filtered = varities;

    if (limitColors.length) {
        filtered = filtered.filter(
            (v) => v.rawColor && limitColors.includes(v.rawColor.toLowerCase())
        );
    }

    if (limitTypes.length) {
        filtered = filtered.filter(
            (v) => v.type && limitTypes.includes(v.type.toLowerCase())
        );
    }

    // Si el producto no tiene variedades cargadas pero el combo sí define
    // límites, esos límites son las opciones a mostrar.
    if (!filtered.length && (limitColors.length || limitTypes.length)) {
        const colors = item.limitColors?.length ? item.limitColors : [null];
        const types = item.limitTypes?.length ? item.limitTypes : [null];

        filtered = [];

        types.forEach((type) => {
            colors.forEach((color) => {
                filtered.push({
                    image: "",
                    type: type || null,
                    rawColor: color || null,
                    color: color ? detectColor(color) || color : null,
                });
            });
        });
    }

    return filtered;
}

export function renderComboDetail(combo, onSelectionChange) {
    if (!combo) return;

    const images = renderDetailBase(combo);

    /* =========================
       VARIEDADES DEL COMBO QUE SE PUEDEN ELEGIR (TIPO Y COLOR)
    ========================= */

    const variantsContainer = document.getElementById("variants");

    if (!variantsContainer) return;

    variantsContainer.innerHTML = "";

    const products = combo.products || [];

    const state = (combo.defaultSelected || []).map((item) => {
        const product = products.find((p) => p.id === item.productId);

        return {
            item,
            product,
            productName: item.productName || product?.name || "",
            varities: item.default ? [] : getSelectableVarities(item, product),
            selectedType: null,
            selectedColor: null,
            selectedVariant: null,
        };
    });

    function buildSelections() {
        return state.map((s) => {
            const selection = {};

            const select = {};

            if (s.selectedType) select.type = s.selectedType;
            if (s.selectedColor) select.color = s.selectedColor;

            if (Object.keys(select).length) selection.select = select;

            if (s.item.default) selection.default = s.item.default;

            selection.productId = s.item.productId;

            if (s.item.limitColors) selection.limitColors = s.item.limitColors;
            if (s.item.limitTypes) selection.limitTypes = s.item.limitTypes;

            if (s.productName) selection.productName = s.productName;

            return selection;
        });
    }

    function notify() {
        if (onSelectionChange) onSelectionChange(buildSelections());
    }

    // Solo cambiamos la imagen del combo si la variedad elegida tiene una
    // imagen que forma parte de la galería del combo.
    function updateImageByVariant(s) {
        if (!s.selectedVariant?.image) return;

        const img = s.selectedVariant.image.replace(/\s/g, "");

        const index = images.findIndex((i) => i === img);

        if (index !== -1) updateGalleryImage(index);
    }

    function syncVariant(s) {
        s.selectedVariant =
            s.varities.find(
                (v) =>
                    (!s.selectedType || v.type === s.selectedType) &&
                    (!s.selectedColor || v.rawColor === s.selectedColor)
            ) || null;
    }

    state.forEach((s) => {
        // Si el combo ya trae la variedad definida, no se muestra nada.
        if (s.item.default) return;

        if (!s.varities.length) return;

        const availableTypes = [
            ...new Set(s.varities.map((v) => v.type)),
        ].filter((type) => type !== null && type !== undefined && type !== "");

        // Un color por clave normalizada, guardando el valor original
        const colorOptions = [];

        s.varities.forEach((v) => {
            if (!v.color) return;

            if (colorOptions.some((c) => c.key === v.color)) return;

            colorOptions.push({ key: v.color, raw: v.rawColor });
        });

        if (!availableTypes.length && !colorOptions.length) return;

        const productWrapper = document.createElement("div");
        productWrapper.classList.add("combo-variant-product");

        if (s.productName) {
            const title = document.createElement("p");
            title.classList.add("combo-variant-title");
            title.textContent = s.productName;
            productWrapper.appendChild(title);
        }

        variantsContainer.appendChild(productWrapper);

        // ===== Tipos =====
        if (availableTypes.length) {
            const typeWrapper = document.createElement("div");
            productWrapper.appendChild(typeWrapper);

            s.selectedType = availableTypes[0];
            syncVariant(s);

            renderTypes(
                availableTypes,
                () => updateImageByVariant(s),
                typeWrapper,
                (type) => {
                    s.selectedType = type;

                    syncVariant(s);

                    notify();

                    updateImageByVariant(s);
                }
            );
        }

        // ===== COLORES =====
        if (colorOptions.length) {
            const colorWrapper = document.createElement("div");
            productWrapper.appendChild(colorWrapper);

            s.selectedColor = colorOptions[0].raw;
            syncVariant(s);

            renderColors(
                colorOptions.map((c) => c.key),
                () => updateImageByVariant(s),
                colorWrapper,
                colorMap,
                (color) => {
                    s.selectedColor =
                        colorOptions.find((c) => c.key === color)?.raw || color;

                    syncVariant(s);

                    notify();

                    updateImageByVariant(s);
                }
            );
        }

        updateImageByVariant(s);
    });

    notify();
}
