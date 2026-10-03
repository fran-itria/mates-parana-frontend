import { renderColors } from "../Services/renderColors.js";
import { renderTypes } from "../Services/renderTypes.js";
import { updateGalleryImage, showImage, preloadImages } from "../Services/updateGalleryImages.js";
import { detectColor } from "../Services/detectColor.js";
import { renderDetailBase } from "../Services/renderDetailBase.js";
import { colorMap } from "../Const/const.js"
import { hasCentralStock } from "../Services/hasCentralStock.js";

/**
 * Normaliza las variedades de un producto del combo conservando el valor
 * original del color (el que espera el backend) además de la clave
 * normalizada que se usa para pintar el círculo de color.
 */
function normalizeComboVarities(varities = []) {
    return varities.map((v, index) => {
        const rawColor = v.color || null;

        const detected = detectColor(
            `${v.color || ""} ${v.name || ""} ${v.description || ""}`
        );

        return {
            ...v,
            // Posición en el producto: se usa para elegir la foto del combo
            index,
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

/**
 * Las promos se distinguen de los combos por el nombre ("Promo ...").
 * En las promos el grabado no se cobra y se muestra la foto de la variante.
 */
export function isPromo(combo) {
    return /^promo\b/i.test((combo?.name || "").trim());
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

    const promo = isPromo(combo);

    // En las promos se muestra la foto propia de la variedad elegida.
    // En los combos, si la imagen de la variedad está en la galería se usa
    // esa; si no, se relaciona por posición: la variedad N del producto se
    // corresponde con la foto N + 1 del combo (la primera es la portada).
    function updateImageByVariant(s) {
        const variant = s.selectedVariant;

        if (!variant) return;

        const img = variant.image?.replace(/\s/g, "");

        if (promo && img) return showImage(img);

        const imageIndex = img ? images.findIndex((i) => i === img) : -1;

        if (imageIndex !== -1) return updateGalleryImage(imageIndex);

        if (variant.index === undefined) return;

        const positionIndex = variant.index + 1;

        if (positionIndex < images.length) updateGalleryImage(positionIndex);
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

        const typeWrapper = document.createElement("div");
        const colorWrapper = document.createElement("div");

        // Los colores dependen del tipo elegido, por eso se vuelven a dibujar
        // cada vez que cambia el tipo
        function renderColorOptions() {
            if (!colorOptions.length) return;

            // Un color se puede elegir si hay stock en Casa Central de ese
            // color para el tipo seleccionado (si el producto tiene tipos)
            const disabledColors = colorOptions
                .filter(
                    (c) =>
                        !s.varities.some(
                            (v) =>
                                v.color === c.key &&
                                (!availableTypes.length || v.type === s.selectedType) &&
                                hasCentralStock(v)
                        )
                )
                .map((c) => c.key);

            const currentKey = colorOptions.find((c) => c.raw === s.selectedColor)?.key;

            // Si el color actual no tiene stock para este tipo, pasamos al primero disponible
            if (!currentKey || disabledColors.includes(currentKey)) {
                s.selectedColor =
                    colorOptions.find((c) => !disabledColors.includes(c.key))?.raw || null;
            }

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
                },
                disabledColors,
                colorOptions.find((c) => c.raw === s.selectedColor)?.key || null
            );
        }

        // ===== Tipos =====
        if (availableTypes.length) {
            productWrapper.appendChild(typeWrapper);

            // Un tipo sin stock en Casa Central en ningún color no se puede elegir
            const disabledTypes = availableTypes.filter(
                (type) => !s.varities.some((v) => v.type === type && hasCentralStock(v))
            );

            s.selectedType =
                availableTypes.find((type) => !disabledTypes.includes(type)) || null;

            renderTypes(
                availableTypes,
                () => updateImageByVariant(s),
                typeWrapper,
                (type) => {
                    s.selectedType = type;

                    renderColorOptions();

                    syncVariant(s);

                    notify();

                    updateImageByVariant(s);
                },
                disabledTypes
            );
        }

        // ===== COLORES =====
        if (colorOptions.length) {
            productWrapper.appendChild(colorWrapper);

            renderColorOptions();
        }

        // Al cargar se deja la portada; la foto cambia cuando se elige
        syncVariant(s);
    });

    // En las promos se precargan las fotos de las variedades para que el
    // cambio al elegir sea inmediato
    if (promo) {
        preloadImages(
            state.flatMap((s) =>
                s.varities.map((v) => v.image?.replace(/\s/g, ""))
            )
        );
    }

    notify();
}
