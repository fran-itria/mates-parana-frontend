export function renderColors(
    availableColors,
    updateImageByVariant,
    colorWrapper,
    colorMap,
    onColorChange,
    disabledOptions = [],
    selectedOption = null
) {
    colorWrapper.innerHTML = "<p>Color</p>";

    const firstEnabled = availableColors.find((o) => !disabledOptions.includes(o));

    const activeColor =
        selectedOption && !disabledOptions.includes(selectedOption)
            ? selectedOption
            : firstEnabled;

    availableColors.forEach((color) => {
        const colorBtn = document.createElement("span");

        colorBtn.classList.add("variant-color");

        colorBtn.style.background = colorMap[color] || color;

        if (disabledOptions.includes(color)) {
            colorBtn.classList.add("disabled");
            colorBtn.title = "Sin stock";
            colorWrapper.appendChild(colorBtn);
            return;
        }

        if (color === activeColor) {
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