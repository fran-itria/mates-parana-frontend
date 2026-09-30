import { renderColors } from "../Services/renderColors.js";
import { renderTypes } from "../Services/renderTypes.js";
import { updateGalleryImage } from "../Services/updateGalleryImages.js";
import { detectColor } from "../Services/detectColor.js";
import { normalizeVarities } from "../Services/normalizeVarities.js";
import { renderDetailBase } from "../Services/renderDetailBase.js";
import { colorMap } from "../Const/const.js";
import { hasCentralStock } from "../Services/hasCentralStock.js";

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

    const isValid = (value) => value !== null && value !== undefined && value !== "";

    const availableTypes = [...new Set(varities.map((v) => v.type))].filter(isValid);
    const availableColors = [...new Set(varities.map((v) => v.color))].filter(isValid);

    const hasTypes = availableTypes.length > 0;
    const hasColors = availableColors.length > 0;

    // Variedad que coincide con el tipo y color elegidos
    function findVariant(type, color) {
      return (
        varities.find(
          (v) => (!hasTypes || v.type === type) && (!hasColors || v.color === color)
        ) || null
      );
    }

    // Un color se puede elegir si hay stock en Casa Central de ese color
    // para el tipo seleccionado (si el producto tiene tipos)
    function getDisabledColors() {
      return availableColors.filter(
        (color) =>
          !varities.some(
            (v) =>
              v.color === color &&
              (!hasTypes || v.type === selectedType) &&
              hasCentralStock(v)
          )
      );
    }

    function updateImageByVariant() {
      const match =
        selectedVariant ||
        varities.find((v) => {
          if (selectedColor) return v.color === selectedColor;
          else if (selectedType) return v.type === selectedType;
        });
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

    function updateSelection() {
      selectedVariant = findVariant(selectedType, selectedColor);
      onVariantChange(selectedColor, selectedType, selectedVariant);
      updateImageByVariant();
    }

    const typeWrapper = document.createElement("div");
    const colorWrapper = document.createElement("div");

    // Los colores dependen del tipo elegido, por eso se vuelven a dibujar
    // cada vez que cambia el tipo
    function renderColorOptions() {
      if (!hasColors) return;

      const disabledColors = getDisabledColors();

      // Si el color actual no tiene stock para este tipo, pasamos al primero disponible
      if (!selectedColor || disabledColors.includes(selectedColor)) {
        selectedColor =
          availableColors.find((color) => !disabledColors.includes(color)) || null;
      }

      renderColors(
        availableColors,
        updateImageByVariant,
        colorWrapper,
        colorMap,
        (color) => {
          selectedColor = color;
          updateSelection();
        },
        disabledColors,
        selectedColor
      );
    }

    // ===== Tipos =====
    if (hasTypes) {
      variantsContainer.appendChild(typeWrapper);

      // Un tipo sin stock en Casa Central en ningún color no se puede elegir
      const disabledTypes = availableTypes.filter(
        (type) => !varities.some((v) => v.type === type && hasCentralStock(v))
      );

      selectedType =
        availableTypes.find((type) => !disabledTypes.includes(type)) || null;

      renderTypes(
        availableTypes,
        updateImageByVariant,
        typeWrapper,
        (type) => {
          selectedType = type;
          renderColorOptions();
          updateSelection();
        },
        disabledTypes
      );
    }

    // ===== COLORES =====
    if (hasColors) {
      variantsContainer.appendChild(colorWrapper);
      renderColorOptions();
    }

    updateSelection();
  }
}
