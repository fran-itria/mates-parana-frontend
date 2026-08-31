const PROMOS_URL =
  "https://matesparana-backend-production.up.railway.app/promotions";

const SHIPPING_API =
  "https://matesparana-backend-production.up.railway.app/orders/delivered-price/";

const API_URL =
  "https://matesparana-backend-production.up.railway.app/products?sort=createdAt_desc";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const type = params.get("type"); // "combo" o null

console.log("ID desde URL:", productId);

let allProducts = [];
let currentProduct = null;

let selectedType = null;
let selectedColor = null;
let selectedVariant = null;

/* ==========================
   GALERÍA
========================== */

let galleryImages = [];
let currentImageIndex = 0;

function updateGalleryImage(index) {
  if (!galleryImages.length) return;

  currentImageIndex = index;

  const mainImage = document.getElementById("mainImage");

  mainImage.classList.add("fade");

  setTimeout(() => {
    mainImage.src = galleryImages[currentImageIndex];

    document.querySelectorAll(".gallery-thumbs img").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === currentImageIndex);
    });

    mainImage.classList.remove("fade");
  }, 150);
}

async function getProductDetail() {
  if (type === "combo") {
    const res = await fetch(
      "https://matesparana-backend-production.up.railway.app/promotions"
    );

    const data = await res.json();
    const promos = data.promotions; // 👈 clave

    const combo = promos.find((p) => String(p.id) === String(productId));
    console.log(combo);

    if (!combo) return;

    currentProduct = combo;

    renderComboDetail(combo);

    return;
  }

  const res = await fetch(API_URL);
  const data = await res.json();

  allProducts = data.products; // 👈 clave

  currentProduct = data.products.find(
    (p) => String(p.id) === String(productId)
  );
  if (!currentProduct) return;

  renderProduct(currentProduct);
  renderSimilar(currentProduct);
  renderRandomCombos(currentProduct);
}

/* ================= RENDER PRODUCTO ================= */
function renderProduct(p) {
  if (!p) return;

  document.getElementById("productName").textContent = p.name;

  // Precio base (transferencia)
  const transferPrice = p.discountedPrice ?? p.price;

  // Precio con tarjeta (+15%)
  const cardPrice = Math.round(transferPrice * 1.15);

  document.getElementById("transferPrice").textContent =
    "Precio con transferencia";

  document.getElementById(
    "productPrice"
  ).textContent = `$${transferPrice.toLocaleString("es-AR")}`;

  const oldPriceEl = document.getElementById("oldPrice");
  if (p.discountedPrice) {
    oldPriceEl.textContent = `$${p.price.toLocaleString("es-AR")}`;
    oldPriceEl.style.display = "block";
  } else {
    oldPriceEl.style.display = "none";
  }

  document.getElementById("productDescription").innerText = p.description || "";
  document.getElementById("breadcrumbCategory").textContent = p.type || "";

  const thumbs = document.getElementById("galleryThumbs");
  const mainImage = document.getElementById("mainImage");

  thumbs.innerHTML = "";

  let images = [];

  if (Array.isArray(p.image) && p.image.length) {
    images = p.image.map((img) => img.replace(/\s/g, ""));
  } else {
    images = ["https://via.placeholder.com/400"];
  }

  galleryImages = images;
  currentImageIndex = 0;

  const visibleImages = galleryImages.slice(0, 4);

  // imagen inicial
  updateGalleryImage(0);

  // thumbs
  visibleImages.forEach((img, index) => {
    console.log("galleryImages:", galleryImages);
    console.log("visibleImages:", visibleImages);
    console.log("thumbs:", thumbs);
    const thumb = document.createElement("img");
    thumb.src = img;

    if (index === 0) thumb.classList.add("active");

    thumb.addEventListener("click", () => {
      updateGalleryImage(index);
    });

    thumbs.appendChild(thumb);
  });

  // ===== FLECHAS =====
  const prevBtn = document.getElementById("prevImg");
  const nextBtn = document.getElementById("nextImg");

  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => {
      const newIndex =
        (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;

      updateGalleryImage(newIndex);
    };

    nextBtn.onclick = () => {
      const newIndex = (currentImageIndex + 1) % galleryImages.length;

      updateGalleryImage(newIndex);
    };
  }

  // MEDIOS DE PAGO dinámico
  const paymentEl = document.getElementById("paymentInfo");

  if (paymentEl) {
    const cuotas = Math.round(cardPrice / 3);

    paymentEl.innerHTML = `
Precio con tarjeta: $${cardPrice.toLocaleString("es-AR")}<br>
3 x $${cuotas.toLocaleString("es-AR")} sin interés<br><br>

Precio con transferencia: $${transferPrice.toLocaleString("es-AR")}
`;
  }

  //informacion pago

  const cuotas = Math.round(cardPrice / 3);

  document.getElementById("installments").innerHTML = `Precio con tarjeta<br>
   $${cardPrice.toLocaleString("es-AR")}<br>
   3 x $${cuotas.toLocaleString("es-AR")} sin interés`;

  document.getElementById("shippingText").textContent =
    "Envío gratis superando los $80.000,00";

  //============variantes de cada producto:
  console.log("variants:", p.variants);
  console.log("varities:", p.varities);
  console.log(p.variants);

  function detectColor(text = "") {
    text = text.toLowerCase();

    const colors = {
      negro: ["negro"],

      blanco: ["blanco"],

      rojo: ["rojo"],

      rojoOscuro: ["rojo oscuro"],

      rosa: ["rosa", "pink"],

      marron: ["marron", "marrón"],

      marronClaro: ["marron claro", "marrón claro"],

      marronOscuro: ["marron oscuro", "marrón oscuro"],

      beige: ["beige", "nude"],

      verde: ["verde"],

      azul: ["azul"],

      amarillo: ["amarillo"],

      violeta: ["violeta", "lila"],

      gris: ["gris"],

      chocolate: ["chocolate", "marronoscuro"],

      borravino: ["bordo", "borra vino", "borravino", "vino"],
    };

    for (const [key, aliases] of Object.entries(colors)) {
      if (aliases.some((alias) => text.includes(alias))) {
        return key;
      }
    }

    return null;
  }

  function normalizeVarities(varities) {
    return varities.map((v) => ({
      ...v,

      color: detectColor(
        `${v.color || ""} ${v.name || ""} ${v.description || ""}`
      ),
    }));
  }

  const varities = normalizeVarities(p.varities || []);

  const variantsContainer = document.getElementById("variants");

  if (variantsContainer && varities) {
    variantsContainer.innerHTML = "";

    // ✅ FUNCIÓN CORRECTA (UNA SOLA)
    function updateImageByVariant() {
      const match = varities.find((v) => v.color === selectedColor);

      selectedVariant = match || null;

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

    // ===== COLORES =====

    const colorWrapper = document.createElement("div");

    const colorMap = {
      negro: "#000",
      blanco: "#fff",
      rojo: "#c00",
      rojoOscuro: "rgb(112, 7, 7)",
      rosa: "rgb(233, 152, 152)",
      verde: "#477e4c",
      azul: "#34449b",
      amarillo: "#ffd23d",
      violeta: "#773dff",
      gris: "#757575",
      marron: "#553321",
      chocolate: "#4d2e1e",
      marronclaro: "#e08f64",
      marronoscuro: "#442617",
      borravino: "#5e2231",
      beige: "#d2b48c",
    };

    const availableColors = [...new Set(varities.map((v) => v.color))];
    function renderColors() {
      colorWrapper.innerHTML = "<p>Color</p>";

      const availableColors = [...new Set(varities.map((v) => v.color))];

      // Si el color seleccionado ya no existe para ese tipo
      if (!availableColors.includes(selectedColor)) {
        selectedColor = availableColors[0] || null;
      }

      availableColors.forEach((color) => {
        const colorBtn = document.createElement("span");

        colorBtn.classList.add("variant-color");

        colorBtn.style.background = colorMap[color] || color;

        if (color === selectedColor) {
          colorBtn.classList.add("active");
        }

        colorBtn.addEventListener("click", () => {
          selectedColor = color;

          renderColors();
          updateImageByVariant();
        });

        colorWrapper.appendChild(colorBtn);
      });
    }

    variantsContainer.appendChild(colorWrapper);
    selectedColor = availableColors[0];

    renderColors();

    updateImageByVariant();
  }
}

//========================================================

/*====RENDER COMBO================*/
function renderComboDetail(combo) {
  document.getElementById("productName").textContent = combo.name;

  const finalPrice = combo.discountedPrice ?? combo.price;

  const transferPrice = Math.round(finalPrice * 0.85);

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

/* ================= SIMILARES ================= */
function renderSimilar(p) {
  const container = document.getElementById("similarProducts");

  let similares = allProducts.filter((x) => {
    if (x.id === p.id) return false;

    // misma categoría / tipo principal
    if (x.type && p.type && x.type === p.type) return true;

    // fallback: mismo nombre base (por si el backend es medio random)
    const baseNameX = x.name.toLowerCase().split(" ")[0];
    const baseNameP = p.name.toLowerCase().split(" ")[0];

    return baseNameX === baseNameP;
  });

  // shuffle para que no sean siempre los mismos
  similares = similares.sort(() => 0.5 - Math.random()).slice(0, 4);

  container.innerHTML = similares
    .map(
      (prod) => `
      <a href="./producto-card.html?id=${prod.id}" class="product-card">
        <img src="${prod.image[0].replace(/\s/g, "")}" alt="${prod.name}">
        <div class="product-name">${prod.name}</div>
        <div class="product-price">$${prod.price.toLocaleString("es-AR")}</div>
      </a>
    `
    )
    .join("");
}

/* ================= COMPLEMENTOS ================= */
function renderRandomCombos(p) {
  const container = document.getElementById("comboProducts");

  const randoms = allProducts
    .filter((x) => x.id !== p.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  container.innerHTML = randoms
    .map(
      (prod) => `
      <a href="./producto-card.html?id=${prod.id}" class="product-card">
        <img src="${prod.image[0].replace(/\s/g, "")}" alt="${prod.name}">
        <div class="product-name">${prod.name}</div>
        <div class="product-price">$${prod.price.toLocaleString("es-AR")}</div>
      </a>
    `
    )
    .join("");
}

/*=========================
CALCULO DE ENVIO
==========================*/

const postalInput = document.getElementById("postalCode");

const calcShippingBtn = document.getElementById("calcShipping");

const shippingResult = document.getElementById("shippingResult");

if (calcShippingBtn) {
  calcShippingBtn.addEventListener("click", calculateShipping);
}

async function calculateShipping() {
  const postalCode = postalInput.value.trim().toUpperCase();

  if (!postalCode) {
    shippingResult.innerHTML = "<p>Ingresá un código postal.</p>";

    return;
  }

  try {
    const response = await fetch(SHIPPING_API + postalCode);

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    console.log(data);

    renderShipping(data, postalCode);
  } catch (error) {
    shippingResult.innerHTML = `

        <p>

        No se encontró el código postal.

        </p>

        `;
  }
}

function formatAgencyName(agency) {
  const cleanAgency = agency.replace("Correo Argentino Clasico - ", "").trim();

  const parts = cleanAgency.split(",");

  const firstPart = parts[0] || "";

  const city = parts[1] || "";

  const sections = firstPart.split(" - ");

  return {
    title: sections[1] || "Correo Argentino",
    address: sections[2] || "",
    city: city.trim(),
  };
}

function renderShipping(data, postalCode) {
  shippingResult.innerHTML = `
<div class="shipping-info">

  <div class="shipping-card province-card">

      <small>Provincia</small>

      <strong>${data.province}</strong>

  </div>

${
  postalCode === "E3100"
    ? `

<div class="shipping-card local-card">

    <label class="shipping-option">

        <input
            type="radio"
            name="shippingType"
            value="local"
        >

        <div class="local-info">

            <strong>🏪 Retirá en nuestro local</strong>

            <p class="shipping-free">
                GRATIS
            </p>

            <small>

                <strong>Casa Central</strong><br>

                Kentenich 825,
                Paracao,
                Paraná,
                Entre Ríos

            </small>

            <div class="pickup-time">

                <span class="pickup-badge">

                    Retirás hoy

                </span>

            </div>

            <div class="pickup-schedule">

                <strong>Horarios</strong>

                <p>

                    Lunes a Viernes<br>

                    10:00 a 13:00<br>

                    17:00 a 20:00

                </p>

                <p>

                    Sábados

                    10:00 a 13:00

                </p>

                <small>

                    El tiempo de entrega no contempla feriados.

                </small>

            </div>

        </div>

    </label>

</div>

`
    : ""
}
${
  data.cadete
    ? `

<div class="shipping-card">

    <label class="shipping-option">

        <input
            type="radio"
            name="shippingType"
            value="cadete"
        >

        <div class="cadete-info">

            <strong>🛵 Envío por cadete</strong>

            <p>

                Disponible para algunas ciudades de Entre Ríos

            </p>

            <select id="cadeteCity">

                ${data.cadete
                  .map(
                    (city) => `

                    <option
                        value="${city.ciudad}"
                        data-price="${city.price}"
                    >

                        ${city.ciudad}

                    </option>

                `
                  )
                  .join("")}

            </select>

            <p class="cadete-price">

                $${data.cadete[0].price.toLocaleString("es-AR")}

            </p>

        </div>

    </label>

</div>

`
    : ""
}



<div class="shipping-card">

    <label class="shipping-option">

        <input
            type="radio"
            name="shippingType"
            value="home"
            checked
        >

        <div>

            <strong>🚚 Envío a domicilio</strong>

            <p>

                $${data.price.toLocaleString("es-AR")}

            </p>

        </div>

    </label>

</div>

  <div class="shipping-card">

      <label class="shipping-option">

          <input
              type="radio"
              name="shippingType"
              value="agency"
          >

          <div>

              <strong>🏤 Retiro en Correo Argentino</strong>

              <p>

                  ${data.retirePoints.length}
                  sucursales disponibles

              </p>

          </div>

      </label>

      <div id="agencyContainer"></div>

  </div>

</div>
`;

  const agencyContainer = document.getElementById("agencyContainer");

  const shippingOptions = document.querySelectorAll(
    'input[name="shippingType"]'
  );

  const cadeteSelect = document.getElementById("cadeteCity");

  const cadetePrice = document.querySelector(".cadete-price");

  shippingOptions.forEach((option) => {
    option.addEventListener("change", () => {
      if (option.value === "agency") {
        agencyContainer.innerHTML = data.retirePoints
          .map(
            (point) => `
            ${(() => {
              const agency = formatAgencyName(point.agency);

              return `

<label class="agency-option">

    <input
        type="radio"
        name="agency"
        value="${point.agency_id}"
    >

    <div>

        <strong>${agency.title}</strong>

        <small>

            ${agency.address}<br>

            ${agency.city}

        </small>

    </div>

</label>

`;
            })()}
            <br>
          `
          )
          .join("");

        document.querySelectorAll('input[name="agency"]').forEach((radio) => {
          radio.addEventListener("change", () => {
            const selectedPoint = data.retirePoints.find(
              (p) => p.agency_id === radio.value
            );
          });
        });
      } else if (option.value === "cadete") {
        agencyContainer.innerHTML = "";

        const selectedOption = cadeteSelect.options[cadeteSelect.selectedIndex];
      } else if (option.value === "home") {
        agencyContainer.innerHTML = "";
      } else if (option.value === "local") {
        agencyContainer.innerHTML = "";
      }
    });
  });

  if (cadeteSelect) {
    cadeteSelect.addEventListener("change", () => {
      const selectedOption = cadeteSelect.options[cadeteSelect.selectedIndex];

      const price = Number(selectedOption.dataset.price);

      cadetePrice.textContent = "$" + price.toLocaleString("es-AR");
    });
  }
}

/*=========================================================== */

/* ================= ACORDEONES ================= */
document.querySelectorAll(".accordion-item button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("open");
  });
});

getProductDetail();

/*===========================Agregar al carrito=================================== */
const addToCartBtn = document.getElementById("addToCartBtn");

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    const selectedVarity = {};

    if (selectedType) {
      selectedVarity.type = selectedType;
    }

    if (selectedColor) {
      selectedVarity.color = selectedColor;
    }

    const variantImage =
      selectedVariant?.image?.replace(/\s/g, "") ||
      currentProduct.image?.[0]?.replace(/\s/g, "") ||
      "";

    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.discountedPrice ?? currentProduct.price,
      image: variantImage,
      qty: parseInt(document.getElementById("qtyInput").value) || 1,
      varity: Object.keys(selectedVarity).length > 0 ? selectedVarity : null,
      promotion: type === "combo",
    });
  });
}

/*===================BOTONES MAS Y MENOS========================= */

const minusBtn = document.getElementById("minusQty");
const plusBtn = document.getElementById("plusQty");
const qtyInput = document.getElementById("qtyInput");

if (minusBtn && plusBtn && qtyInput) {
  minusBtn.addEventListener("click", () => {
    let value = parseInt(qtyInput.value) || 1;
    if (value > 1) {
      qtyInput.value = value - 1;
    }
  });

  plusBtn.addEventListener("click", () => {
    let value = parseInt(qtyInput.value) || 1;
    qtyInput.value = value + 1;
  });
}

/**====================DESCRIPCION=========================== */
function moveDescriptionMobile() {
  const description = document.getElementById("productDescriptionBox");
  const info = document.querySelector(".product-info");
  const accordion = document.querySelector(".accordion");
  const gallery = document.querySelector(".product-gallery");

  if (!description || !info || !accordion || !gallery) return;

  if (window.innerWidth <= 768) {
    if (description.parentElement !== info) {
      info.insertBefore(description, accordion);
    }
  } else {
    const galleryContainer = gallery.children[1];

    if (description.parentElement !== galleryContainer) {
      galleryContainer.appendChild(description);
    }
  }
}

window.addEventListener("load", moveDescriptionMobile);
window.addEventListener("resize", moveDescriptionMobile);

/* ==========================
   ZOOM IMAGEN PRODUCTO
========================== */

const mainImageZoom = document.getElementById("mainImage");

const imageModal = document.getElementById("imageModal");

const modalImage = document.getElementById("modalImage");
const modalPrev = document.getElementById("modalPrev");
const modalNext = document.getElementById("modalNext");

const closeModal = document.getElementById("closeModal");
let modalImageIndex = 0;

function updateModalImage(index) {
  if (!galleryImages.length) return;

  modalImageIndex = index;

  modalImage.classList.add("fade");

  setTimeout(() => {
    modalImage.src = galleryImages[modalImageIndex];

    modalImage.classList.remove("fade");
  }, 120);
}

function changeModalImage(direction) {
  if (!galleryImages.length) return;

  modalImageIndex =
    (modalImageIndex + direction + galleryImages.length) % galleryImages.length;

  updateModalImage(modalImageIndex);
}

if (mainImageZoom && imageModal && modalImage) {
  mainImageZoom.addEventListener("click", () => {
    modalImageIndex = currentImageIndex;

    updateModalImage(modalImageIndex);

    imageModal.classList.add("active");
  });
  if (modalPrev && modalNext) {
    modalPrev.addEventListener("click", () => {
      changeModalImage(-1);
    });

    modalNext.addEventListener("click", () => {
      changeModalImage(1);
    });
  }

  closeModal.addEventListener("click", () => {
    imageModal.classList.remove("active");
  });

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.remove("active");
    }
  });
}
