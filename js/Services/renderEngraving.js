/**
 * Renderiza la opción de grabado (con / sin) dentro del contenedor de
 * variantes. Por defecto queda seleccionado "Con grabado".
 *
 * - price: precio del grabado; si es 0 se muestra como sin cargo.
 * - onChange(engraved): se llama cada vez que cambia la opción.
 */
export function renderEngraving(container, price, onChange) {
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "engraving-options";
    wrapper.innerHTML = "<p>Grabado</p>";

    const priceLabel = price > 0
        ? `(+$${price.toLocaleString("es-AR")})`
        : "(sin cargo)";

    const options = [
        { engraved: true, label: `Con grabado ${priceLabel}` },
        { engraved: false, label: "Sin grabado" },
    ];

    options.forEach(({ engraved, label }) => {
        const btn = document.createElement("span");

        btn.classList.add("variant-type");
        btn.textContent = label;

        if (engraved) btn.classList.add("active");

        btn.addEventListener("click", () => {
            wrapper
                .querySelectorAll(".variant-type")
                .forEach((b) => b.classList.remove("active"));

            btn.classList.add("active");

            onChange(engraved);
        });

        wrapper.appendChild(btn);
    });

    container.appendChild(wrapper);
    onChange(true);
}
