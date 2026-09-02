export function renderColors(
    availableColors,
    updateImageByVariant,
    colorWrapper,
    colorMap,
    onColorChange
) {
    colorWrapper.innerHTML = "<p>Color</p>";

    availableColors.forEach((color, i) => {
        const colorBtn = document.createElement("span");

        colorBtn.classList.add("variant-color");

        colorBtn.style.background = colorMap[color] || color;

        if (i == 0) {
            colorBtn.classList.add("active");
        }

        colorBtn.addEventListener("click", () => {

            // visualmente seleccionarlo
            colorWrapper
                .querySelectorAll(".variant-color")
                .forEach(btn => btn.classList.remove("active"));

            colorBtn.classList.add("active");

            // 👇 ESTO ES LO IMPORTANTE
            onColorChange(color);
        });

        colorWrapper.appendChild(colorBtn);
    });
}