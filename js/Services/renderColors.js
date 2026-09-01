export function renderColors(
    varities,
    updateImageByVariant,
    colorWrapper,
    selectedColor,
    colorMap
) {
    colorWrapper.innerHTML = "<p>Color</p>";
    const availableColors = [...new Set(varities.map((v) => v.color))];

    // Si el color seleccionado ya no existe para ese tipo
    console.log(availableColors)

    availableColors.forEach((color) => {
        const colorBtn = document.createElement("span");

        colorBtn.classList.add("variant-color");

        colorBtn.style.background = colorMap[color] || color;

        if (color === selectedColor) {
            colorBtn.classList.add("active");
        }

        colorBtn.addEventListener("click", () => {
            selectedColor = color;
            renderColors(varities, updateImageByVariant, colorWrapper, selectedColor, colorMap);
            updateImageByVariant();
        });

        colorWrapper.appendChild(colorBtn);
    });
}