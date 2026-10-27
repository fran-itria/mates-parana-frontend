/**
 * Renderiza la opción de grabado (con / sin) dentro del contenedor de
 * variantes. Por defecto queda seleccionado "Sin grabado".
 *
 * - price: precio del grabado; si es 0 se muestra como sin cargo.
 * - onChange(engraved): se llama cada vez que cambia la opción.
 */

export function renderEngraving(container, price, onChange, product = {}) {
  if (!container) return;

  // Categorías excluidas del grabado
  const excludedCategories = ["Materas y mochilas", "Bombillas"];

  const categories = Array.isArray(product.category) ? product.category : [];

  const hasExcludedCategory = categories.some((category) =>
    excludedCategories.some(
      (excluded) => category.name?.toLowerCase() === excluded.toLowerCase()
    )
  );

  const isTorpedo = product.type?.toLowerCase() === "torpedo";

  const isRanchero = product.name?.toLowerCase().includes("ranchero");

  // Si cumple alguna condición, no mostrar el grabado
  if (hasExcludedCategory || isTorpedo || isRanchero) {
    onChange(false);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "engraving-options";
  wrapper.innerHTML = "<p>Grabado</p>";

  const priceLabel =
    price > 0 ? ` (+$${price.toLocaleString("es-AR")})` : " (sin cargo)";

  const options = [
    { engraved: true, label: `Con grabado${priceLabel}` },
    { engraved: false, label: "Sin grabado" },
  ];

  options.forEach(({ engraved, label }) => {
    const btn = document.createElement("span");

    btn.classList.add("variant-type");
    btn.textContent = label;

    if (!engraved) btn.classList.add("active");

    btn.addEventListener("click", () => {
      wrapper
        .querySelectorAll(".variant-type")
        .forEach((button) => button.classList.remove("active"));

      btn.classList.add("active");
      onChange(engraved);
    });

    wrapper.appendChild(btn);
  });

  container.appendChild(wrapper);
  onChange(false);
}
