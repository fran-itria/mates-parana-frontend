export function renderTypes(
    availableTypes,
    updateImageByVariant,
    typeWrapper,
    onTypeChange,
    disabledOptions = []
) {
    typeWrapper.innerHTML = "<p>Tipo</p>";

    const firstEnabled = availableTypes.find((o) => !disabledOptions.includes(o));

    availableTypes.forEach((type) => {
        const typeBtn = document.createElement("span");

        typeBtn.classList.add("variant-type");
        typeBtn.textContent = type;

        if (disabledOptions.includes(type)) {
            typeBtn.classList.add("disabled");
            typeBtn.title = "Sin stock";
            typeWrapper.appendChild(typeBtn);
            return;
        }

        if (type === firstEnabled) {
            typeBtn.classList.add("active");
        }

        typeBtn.addEventListener("click", () => {

            // visualmente seleccionarlo
            typeWrapper
                .querySelectorAll(".variant-type")
                .forEach(btn => btn.classList.remove("active"));

            typeBtn.classList.add("active");

            // 👇 ESTO ES LO IMPORTANTE
            onTypeChange(type);
        });

        typeWrapper.appendChild(typeBtn);
    });
}