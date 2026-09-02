export function renderTypes(
    availableTypes,
    updateImageByVariant,
    typeWrapper,
    onTypeChange
) {
    typeWrapper.innerHTML = "<p>Tipo</p>";

    availableTypes.forEach((type, i) => {
        const typeBtn = document.createElement("span");

        typeBtn.classList.add("variant-type");
        typeBtn.textContent = type;

        if (i == 0) {
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