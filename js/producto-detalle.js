import { renderComboDetail } from "./Combos/renderCombo.js";
import { renderProduct } from "./Productos/renderProduct.js";
import {
  getGalleryImages,
  getCurrentImageIndex,
} from "./Services/updateGalleryImages.js";
import { API_BASE_PRODUCCION, API_BASE_PRUEBA } from "./Const/const.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const type = params.get("type");

let allProducts = [];
let currentProduct = null;

let selectedType = null;
let selectedColor = null;
let selectedVariant = null;

// Variedades elegidas de cada producto del combo (defaultSelected)
let comboSelections = [];

let data;
async function getProductDetail() {
  if (type === "combo") {
    const res = await fetch(`${API_BASE_PRODUCCION}/promotions/${productId}`);

    data = await res.json();

    if (!data) return;

    currentProduct = data;

    renderComboDetail(data, (selections) => {
      comboSelections = selections;
    });

    return;
  } else {
    const res = await fetch(
      `${API_BASE_PRODUCCION}/products/oneProduct/${productId}`
    );

    data = await res.json();

    if (!data) return;

    currentProduct = data;

    renderProduct(
      data,
      selectedType,
      selectedColor,
      selectedVariant,
      (color, type, variant) => {
        selectedColor = color;
        selectedType = type;
        selectedVariant = variant;
      }
    );
  }
  renderSimilar(data);
  renderComplementProducts(data);
}

//========================================================
/* ================= PRODUCTOS SIMILARES ================= */

function renderSimilar(p) {
  const container = document.getElementById("similarProducts");

  if (!container) {
    console.error("❌ No existe #similarProducts en el HTML");
    return;
  }

  const similares = Array.isArray(p.relatedProducts) ? p.relatedProducts : [];

  if (similares.length === 0) {
    console.warn("⚠️ No hay productos similares");
    container.innerHTML = "";
    return;
  }

  container.innerHTML = similares
    .map((prod) => {
      const image = Array.isArray(prod.image)
        ? prod.image.find((img) => typeof img === "string" && img.trim())
        : typeof prod.image === "string"
          ? prod.image
          : "";

      const cleanImage = image ? image.trim().replace(/\s/g, "") : "";

      const price = prod.discountedPrice ?? prod.price ?? 0;

      return `
        <a href="./producto-card.html?id=${prod.id}" class="product-card">

          <img
            src="${image}"
            alt="${prod.name || "Producto"}"
          >

          <div class="product-name">
            ${prod.name || ""}
          </div>

          <div class="product-price">
            $${Number(price).toLocaleString("es-AR")}
          </div>

        </a>
      `;
    })
    .join("");
}

/* ================= PARA COMPRAR CON ESTE PRODUCTO ================= */

function renderComplementProducts(p) {
  const container = document.getElementById("comboProducts");

  if (!container) {
    console.error("❌ No existe #comboProducts en el HTML");
    return;
  }

  const complementos = Array.isArray(p.complementProducts)
    ? p.complementProducts
    : [];

  if (complementos.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = complementos
    .map((prod) => {
      const image = Array.isArray(prod.image)
        ? prod.image.find((img) => typeof img === "string" && img.trim())
        : typeof prod.image === "string"
          ? prod.image
          : "";

      const cleanImage = image ? image.trim().replace(/\s/g, "") : "";

      const price = prod.discountedPrice ?? prod.price ?? 0;

      return `
        <a href="./producto-card.html?id=${prod.id}" class="product-card">

          <img
            src="${image}"
            alt="${prod.name || "Producto"}"
          >

          <div class="product-name">
            ${prod.name || ""}
          </div>

          <div class="product-price">
            $${Number(price).toLocaleString("es-AR")}
          </div>

        </a>
      `;
    })
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
    const response = await fetch(
      `${API_BASE_PRODUCCION}/orders/delivered-price/${postalCode}`
    );

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

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

${postalCode === "E3100"
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
${data.cadete
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

    const qty = parseInt(document.getElementById("qtyInput").value) || 1;

    if (type == "combo") {
      const comboImage = currentProduct.image?.[0]?.replace(/\s/g, "") || "";

      addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        discountedPrice: currentProduct.discountedPrice,
        cardPrice: currentProduct.cardPrice,
        image: comboImage,
        qty,
        varity: null,
        promotion: true,
        promotionData: {
          id: currentProduct.id,
          name: currentProduct.name,
          image: comboImage,
          price: currentProduct.price,
          custom: 1,
          quantity: qty,
          cardPrice: currentProduct.cardPrice ?? Math.round(price * 1.15),
          defaultSelected: comboSelections,
          discountedPrice: currentProduct.discountedPrice ?? null,
        },
      });
    } else {
      addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        discountedPrice: currentProduct.discountedPrice,
        cardPrice: currentProduct.cardPrice,
        image: variantImage,
        qty,
        varity: Object.keys(selectedVarity).length > 0 ? selectedVarity : null,
        promotion: false,
      });
    }
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
  const galleryImages = getGalleryImages();

  if (!galleryImages.length) return;

  modalImageIndex = index;

  modalImage.classList.add("fade");

  setTimeout(() => {
    modalImage.src = getGalleryImages()[modalImageIndex];

    modalImage.classList.remove("fade");
  }, 120);
}

function changeModalImage(direction) {
  const galleryImages = getGalleryImages();

  if (!galleryImages.length) return;

  modalImageIndex =
    (modalImageIndex + direction + galleryImages.length) % galleryImages.length;

  updateModalImage(modalImageIndex);
}

if (mainImageZoom && imageModal && modalImage) {
  mainImageZoom.addEventListener("click", () => {
    modalImageIndex = getCurrentImageIndex();

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
