document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("discountedTrack");
  const prevBtn = document.getElementById("discountedPrev");
  const nextBtn = document.getElementById("discountedNext");

  if (!track) {
    console.warn("No existe #discountedTrack en el HTML");
    return;
  }

  let products = [];
  let index = 0;

  fetch("https://matesparana-backend-production.up.railway.app/products")
    .then((res) => res.json())
    .then((data) => {
      console.log("Productos del backend:", data);

      // 👉 ACA ESTA EL FILTRO CORRECTO PARA TU BACKEND
      const discountedProducts = data.filter(
        (p) =>
          typeof p.discountedPrice === "number" &&
          p.discountedPrice > 0 &&
          p.discountedPrice < p.price
      );

      console.log("Productos con descuento:", discountedProducts);

      if (discountedProducts.length === 0) {
        track.innerHTML = `<p style="color:#999;">No hay productos en descuento</p>`;
        return;
      }

      renderDiscounted(discountedProducts);
      products = Array.from(track.children);
      updateSlider();

      nextBtn?.addEventListener("click", next);
      prevBtn?.addEventListener("click", prev);
      window.addEventListener("resize", updateSlider);
      setInterval(next, 5000);
    })
    .catch((err) => console.error("Error trayendo productos:", err));

  function renderDiscounted(list) {
    track.innerHTML = list
      .map((p) => {
        const price = Number(p.price);
        const discountedPrice = Number(p.discountedPrice);

        const percent = Math.round(100 - (discountedPrice * 100) / price);

        const image = Array.isArray(p.image) ? p.image[0] : p.image;

        return `
          <div class="product-card">
            <img src="${image}" alt="${p.name}">
            <span class="badge-discount">-${percent}%</span>
            <h3>${p.name}</h3>
            <div class="price">
              <span class="price-final">$${discountedPrice.toLocaleString(
                "es-AR"
              )}</span>
              <span class="price-old">$${price.toLocaleString("es-AR")}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function updateSlider() {
    const card = track.querySelector(".product-card");
    if (!card) return;

    const width = card.offsetWidth + 16;
    track.style.transform = `translateX(-${index * width}px)`;
  }

  function next() {
    if (index < products.length - 3) {
      index++;
    } else {
      index = 0;
    }
    updateSlider();
  }

  function prev() {
    if (index > 0) index--;
    updateSlider();
  }
});
