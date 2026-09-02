export function renderComboDetail(combo) {
    console.log("Render Combo:", combo)
    document.getElementById("productName").textContent = combo.name;

    const finalPrice = combo.discountedPrice ?? combo.price;

    const transferPrice = combo.discountedPrice || combo.price;

    document.getElementById(
        "transferPrice"
    ).textContent = `Precio con transferencia: $${transferPrice.toLocaleString(
        "es-AR"
    )}`;

    document.getElementById(
        "productPrice"
    ).textContent = `$${finalPrice.toLocaleString("es-AR")}`;

    const oldPriceEl = document.getElementById("oldPrice");
    oldPriceEl.textContent = `$${combo.cardPrice.toLocaleString("es-AR")}`;
    oldPriceEl.style.display = "block";

    document.getElementById("productDescription").innerText =
        combo.description || "";

    document.getElementById("breadcrumbCategory").textContent = "Combos materos";

    const mainImage = document.getElementById("mainImage");
    mainImage.src = combo.image?.[0]?.replace(/\s/g, "") || "";

    const thumbs = document.getElementById("galleryThumbs");
    thumbs.innerHTML = "";

    combo.image?.forEach((img) => {
        const thumb = document.createElement("img");
        thumb.src = img.replace(/\s/g, "");

        thumb.addEventListener("click", () => {
            mainImage.src = thumb.src;
        });

        thumbs.appendChild(thumb);
    });
}