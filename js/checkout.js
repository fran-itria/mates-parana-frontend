import {
  API_BASE,
  PAYWAY_API_KEY_PRODUCCION,
  PAYWAY_API_KEY_SANDBOX,
  PAYWAY_URL_PRODUCCION,
  PAYWAY_URL_SANDBOX,
} from "./Const/const.js";

//PRUDUCCIÓN:
const decidir = new Decidir(PAYWAY_URL_PRODUCCION, true);
decidir.setPublishableKey(PAYWAY_API_KEY_PRODUCCION);

//PRUEBA:
// const decidir = new Decidir(PAYWAY_URL_SANDBOX, true);
// decidir.setPublishableKey(PAYWAY_API_KEY_PRUEBA);

decidir.setTimeout(5000);
/* =========================
   STORAGE
========================= */

const cart = JSON.parse(localStorage.getItem("cart")) || [];
const user = JSON.parse(localStorage.getItem("user")) || null;

const backendCartId = localStorage.getItem("backendCartId");

/* =========================
   ELEMENTS
========================= */

const summaryProducts = document.getElementById("summaryProducts");

const summarySubtotal = document.getElementById("summarySubtotal");
const summaryShippingText = document.getElementById("summaryShipping-text");
const summaryShipping = document.getElementById("summaryShipping");
const summaryTotal = document.getElementById("summaryTotal");
const cardText = document.getElementById("card-text")

const deliveryBtns = document.querySelectorAll(".delivery-btn");
const paymentBtns = document.querySelectorAll(".payment-btn");

const shippingFields = document.getElementById("shippingFields");
const cardFields = document.getElementById("cardFields");

const confirmOrderBtn = document.getElementById("confirmOrderBtn");

const paymentBox = document.getElementById("paymentBox");

const orderNumber = document.getElementById("orderNumber");
const paymentAmount = document.getElementById("paymentAmount");
const paymentExpirationDate = document.getElementById("paymentExpirationDate");

const paymentAlias = document.getElementById("paymentAlias");
const paymentCVU = document.getElementById("paymentCVU");

const paymentBeneficiary = document.getElementById("paymentBeneficiary");
const paymentCUIT = document.getElementById("paymentCUIT");
const paymentTransferAmount = document.getElementById("paymentTransferAmount");

const copyAmountBtn = document.getElementById("copyAmountBtn");

const copyAliasBtn = document.getElementById("copyAliasBtn");
const copyCVUBtn = document.getElementById("copyCVUBtn");

const loadingOverlay = document.getElementById("loadingOverlay");

const postalInput = document.getElementById("postalCode");

const calcShippingBtn = document.getElementById("calcShipping");

const shippingResult = document.getElementById("shippingResult");
const shippingExtraFields = document.getElementById("shippingExtraFields");

/* =========================
   STATES
========================= */

let deliveryMethod = "pickup";
let paymentMethod = "transfer";

// Envío seleccionado durante el checkout
let selectedShipping = null;

// Total que se muestra en el resumen, como número
let summaryTotalValue = 0;

/* =========================
   USER DATA
========================= */

function loadUserData() {
  if (!user) return;

  document.getElementById("name").value = user.name || "";
  document.getElementById("surname").value = user.surname || "";
  document.getElementById("email").value = user.mail || "";
  document.getElementById("phone").value = user.phoneNumber || "";
}

async function calculateShipping() {
  const postalCode = postalInput.value.trim().toUpperCase();

  if (!postalCode) {
    shippingResult.innerHTML = "<p>Ingresá un código postal.</p>";

    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/orders/delivered-price/${postalCode}`
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

if (calcShippingBtn) {
  calcShippingBtn.addEventListener("click", calculateShipping);
}

// Precio unitario según el medio de pago, sumando el grabado si corresponde
// (con tarjeta el grabado también lleva el 15%, igual que en la ficha)
function getItemUnitPrice(item, useCardPrice = false) {
  const engraving = item.engravingPrice || 0;
  if (useCardPrice) return item.cardPrice + Math.round(engraving * 1.15);
  return (item.discountedPrice || item.price) + engraving;
}

// Subtotal de productos según el medio de pago elegido (el envío no lleva el 15%)
function getSubtotal() {
  let subtotal = 0;

  cart.forEach((item) => {
    subtotal += getItemUnitPrice(item, paymentMethod == "card") * item.qty;
  });

  return subtotal;
}

function updateSummary(subtotal) {
  let shippingCost = selectedShipping ? selectedShipping.price : 0;

  // Envío gratis
  if (subtotal >= 80000 && selectedShipping?.type !== "local") {
    shippingCost = 0;
  }

  summarySubtotal.textContent = `$${subtotal.toLocaleString("es-AR")}`;

  if (!selectedShipping) {
    summaryShipping.style.visibility = "hidden";
    summaryShippingText.style.visibility = "hidden";
  } else {
    summaryShipping.style.visibility = "visible";
    summaryShippingText.style.visibility = "visible";
    switch (selectedShipping.type) {
      case "Sucursal Urquiza":
        summaryShipping.textContent = selectedShipping.type;
        summaryShippingText.textContent = "Retiro en";
        break;
      case "Casa Central":
        summaryShipping.textContent = selectedShipping.type;
        summaryShippingText.textContent = "Retiro en";
        break;
      case "cadete":
        summaryShippingText.textContent = "Envío";
        summaryShipping.textContent = `🛵 $${shippingCost.toLocaleString("es-AR")}`;
        break;
      case "agency":
        summaryShippingText.textContent = "Envío";
        summaryShipping.textContent = `🏤 $${shippingCost.toLocaleString("es-AR")}`;
        break;
      default:
        summaryShipping.textContent = `🚚 $${shippingCost.toLocaleString("es-AR")}`;
        break;
    }
  }


  const total = subtotal + shippingCost;

  summaryTotalValue = total;

  summaryTotal.textContent = `$${total.toLocaleString("es-AR")}`;

  // Se quita el texto de cuotas anterior para no duplicarlo
  document.getElementById("card-text-element")?.remove();
  document.getElementById("card-text-element-2")?.remove();

  if (paymentMethod == "card") {
    const containerResume = document.getElementsByClassName("summary-total")
    const cardTextElement = document.createElement("p")
    cardTextElement.id = "card-text-element"
    cardTextElement.textContent = "Abonando con tarjeta el pago se realiza en 3 cuotas sin interés"
    const strongText = document.createElement("strong")
    strongText.id = "card-text-element-2"
    strongText.textContent = `3 cuotas de $${(total / 3).toLocaleString("es-AR")} c/u`
    cardTextElement.classList.add("card-text-information")
    containerResume[0].appendChild(cardTextElement)
    containerResume[0].appendChild(strongText)
  }
}

loadUserData();

/* =========================
   RENDER PRODUCTS
========================= */
function renderHomeFields() {
  const container = document.getElementById("homeExtraFields");

  container.innerHTML = `
        <div class="input-group extra-field">
          <label>Provincia</label>
          <input
            type="text"
            id="shippingProvince"
            placeholder="Provincia"
          >
        </div>

        <div class="input-group extra-field">
          <label>Ciudad</label>
          <input
            type="text"
            id="shippingCity"
            placeholder="Ciudad"
          >
        </div>

        <div class="input-group extra-field">
          <label>Calle</label>
          <input
            type="text"
            id="shippingStreet"
            placeholder="Ej: Rosario del Tala 543"
          >
        </div>
        `;
}

function renderCadeteFields() {
  const container = document.getElementById("cadeteExtraFields");

  container.innerHTML = `
        <div class="input-group extra-field">
          <label>Calle</label>
          <input
            type="text"
            id="shippingStreet"
            placeholder="Ej: Rosario del Tala 543"
          >
        </div>
        `;
}

function renderAgencyOptions(
  agencyContainer,
  retirePoints,
  postalCode,
  province,
  price
) {
  agencyContainer.innerHTML = retirePoints
    .map((point) => {
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
    })
    .join("");

  document.querySelectorAll('input[name="agency"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedPoint = retirePoints.find(
        (p) => String(p.agency_id) === String(radio.value)
      );

      if (!selectedPoint) return;

      setSelectedShipping({
        postalCode,
        province,
        type: "agency",
        price: price,
        agency: selectedPoint.agency_id,
        agencyName: selectedPoint.agency,
      });
    });
  });
}

function setSelectedShipping(shippingData) {
  // null limpia la selección (por ejemplo, al volver a "Seleccioná tu ciudad")
  if (!shippingData) {
    selectedShipping = null;

    updateSummary(getSubtotal());

    trackShippingInfo();

    return;
  }

  applySelectedShipping(shippingData);
}

function applySelectedShipping({
  postalCode = "",
  province = "",
  type = null,
  price = 0,
  agency = null,
  agencyName = null,
  city = null,
  address = null,
} = {}) {
  selectedShipping = {
    postalCode,
    province,
    type,
    price,
    agency,
    agencyName,
    city,
    address,
  };

  updateSummary(getSubtotal());

  trackShippingInfo();
}

/* =========================
   TRACKING (GA4 / META)
========================= */

const SHIPPING_TIER_NAMES = {
  home: "Envío a domicilio",
  cadete: "Envío por cadete",
  agency: "Retiro en Correo Argentino",
  local: "Retiro en local",
  "Casa Central": "Retiro en Casa Central",
  "Sucursal Urquiza": "Retiro en Sucursal Urquiza",
};

const PAYMENT_TYPE_NAMES = {
  transfer: "Transferencia",
  card: "Tarjeta",
};

let lastTrackedShipping = null;
let lastTrackedPayment = null;

function trackShippingInfo() {
  const type = selectedShipping?.type;

  if (!type) {
    lastTrackedShipping = null;
    return;
  }

  if (type === lastTrackedShipping) return;
  lastTrackedShipping = type;

  window.MPTrack?.addShippingInfo(cart, SHIPPING_TIER_NAMES[type] || type, {
    useCardPrice: paymentMethod === "card",
  });
}

function trackPaymentInfo() {
  if (!paymentMethod || paymentMethod === lastTrackedPayment) return;
  lastTrackedPayment = paymentMethod;

  window.MPTrack?.addPaymentInfo(
    cart,
    PAYMENT_TYPE_NAMES[paymentMethod] || paymentMethod,
    { useCardPrice: paymentMethod === "card" }
  );
}

// Costo de envío con la misma regla que updateSummary
function getTrackedShippingCost() {
  let shippingCost = selectedShipping ? selectedShipping.price || 0 : 0;

  if (getSubtotal() >= 80000 && selectedShipping?.type !== "local") {
    shippingCost = 0;
  }

  return shippingCost;
}

// Casa Central, Sucursal, cadete, domicilio y Correo Argentino son
// excluyentes: al elegir una se desmarcan las demás y se limpian sus campos
function clearOtherDeliveryOptions(selected) {
  document
    .querySelectorAll('input[name="localBranch"], input[name="shippingType"]')
    .forEach((input) => {
      if (input !== selected) input.checked = false;
    });

  if (selected.value !== "cadete") {
    const cadeteOptions = document.getElementById("cadetePreOptions");
    const cadeteFields = document.getElementById("cadeteExtraFields");

    if (cadeteOptions) cadeteOptions.innerHTML = "";
    if (cadeteFields) cadeteFields.innerHTML = "";
  }

  if (selected.value !== "home") {
    const homeFields = document.getElementById("homeExtraFields");

    if (homeFields) homeFields.innerHTML = "";
  }
}

function renderPreShippingOptions() {
  const container = document.getElementById("preShippingOptions");

  if (!container) return;

  container.innerHTML = `

        <!-- ==========================================
        RETIRO EN LOCAL
    =========================================== -->

        <div class="shipping-card local-card">

          <div class="local-info">

            <strong>🏪 Retirá en nuestro local GRATIS</strong>

            <div class="pickup-locations">

              <!-- CASA CENTRAL -->

              <label class="pickup-location">

                <input
                  type="radio"
                  name="localBranch"
                  value="Casa Central"
                  data-address="Kentenich 825, Paracao, Paraná, Entre Ríos"
                >

                  <div class="pickup-location-content">

                    <strong>Casa Central</strong>

                    <small>
                      Kentenich 825, Paracao, Paraná, Entre Ríos
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
                            Sábados<br>
                              10:00 a 13:00
                          </p>

                          <small>
                            El tiempo de entrega no contempla feriados.
                          </small>

                        </div>

                    </div>

                  </label>


                  <!-- SUCURSAL URQUIZA -->

                  <label class="pickup-location">

                    <input
                      type="radio"
                      name="localBranch"
                      value="Sucursal Urquiza"
                      data-address="Urquiza 785, Paraná, Entre Ríos"
                    >

                      <div class="pickup-location-content">

                        <strong>Sucursal</strong>

                        <small>
                          Urquiza 785, Paraná, Entre Ríos
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
                                Sábados<br>
                                  10:00 a 13:00<br>
                                    17:00 a 20:00
                                  </p>

                                  <small>
                                    El tiempo de entrega no contempla feriados.
                                  </small>

                                </div>

                              </div>

                            </label>

                        </div>

                      </div>

                    </div>


                    <!-- ==========================================
                    ENVÍO POR CADETE
      =========================================== -->

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
                              Seleccioná tu ciudad para consultar el costo de envío.
                            </p>

                            <div id="cadetePreOptions"></div>

                            <div id="cadeteExtraFields"></div>

                          </div>

                      </label>

                    </div>

                    `;

  // ==========================================
  // SUCURSALES
  // ==========================================

  const localBranches = document.querySelectorAll('input[name="localBranch"]');

  const cadeteRadio = document.querySelector(
    'input[name="shippingType"][value="cadete"]'
  );

  localBranches.forEach((branch) => {
    branch.addEventListener("change", () => {
      if (!branch.checked) return;

      clearOtherDeliveryOptions(branch);

      setSelectedShipping({
        type: branch.value,
      });
    });
  });

  // ==========================================
  // CADETE
  // ==========================================

  if (cadeteRadio) {
    cadeteRadio.addEventListener("change", () => {
      if (!cadeteRadio.checked) return;

      clearOtherDeliveryOptions(cadeteRadio);

      // El costo se define recién al elegir la ciudad
      setSelectedShipping(null);

      loadCadeteOptions();
    });
  }
}

async function loadCadeteOptions() {
  const container = document.getElementById("cadetePreOptions");

  if (!container) return;

  container.innerHTML = `
                    <p>
                      Buscando opciones de cadete...
                    </p>
                    `;

  try {
    const response = await fetch(
      `${API_BASE}/orders/delivered-price/E3100`
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las opciones de cadete");
    }

    const data = await response.json();

    if (!data.cadete || data.cadete.length === 0) {
      container.innerHTML = `
        <p>
          No hay opciones de cadete disponibles.
        </p>
      `;

      return;
    }

    container.innerHTML = `

                    <div class="input-group extra-field">

                      <label for="cadeteCity">
                        Ciudad
                      </label>

                      <select id="cadeteCity">

                        <option value="">
                          Seleccioná tu ciudad
                        </option>

                        ${data.cadete
        .map(
          (option) => `
                <option
                  value="${option.ciudad}"
                  data-price="${option.price}"
                >
                  ${option.ciudad} -
                  $${Number(option.price).toLocaleString("es-AR")}
                </option>
              `
        )
        .join("")}

                      </select>

                    </div>

                    `;

    const cadeteSelect = document.getElementById("cadeteCity");

    cadeteSelect.addEventListener("change", () => {
      const selectedOption = cadeteSelect.options[cadeteSelect.selectedIndex];

      // Si vuelve a "Seleccioná tu ciudad"
      if (!selectedOption.value) {
        setSelectedShipping(null);

        document.getElementById("cadeteExtraFields").innerHTML = "";

        return;
      }

      const city = selectedOption.value;

      const price = Number(selectedOption.dataset.price);

      setSelectedShipping({
        type: "cadete",
        city: city,
        price: price,
        postalCode: "",
        province: data.province || "Entre Ríos",
      });

      renderCadeteFields();
    });
  } catch (error) {

    container.innerHTML = `
                    <p>
                      No se pudieron cargar las opciones de cadete.
                      Intentá nuevamente.
                    </p>
                    `;
  }
}

function renderShipping(data, postalCode) {
  shippingResult.innerHTML = `
    <div class="shipping-info">

      <div class="shipping-card province-card">

        <small>Provincia</small>

        <strong>${data.province}</strong>

      </div>


      <!-- ==============================
           ENVÍO A DOMICILIO
      =============================== -->

      <div class="shipping-card">

        <label class="shipping-option">

        <input
            type="radio"
            name="shippingType"
            value="home"
            >

          <div>

            <strong>🚚 Envío a domicilio</strong>

            <p>
              $${Number(data.homePrice).toLocaleString("es-AR")}
            </p>

            <div id="homeExtraFields"></div>

          </div>

        </label>

      </div>


      <!-- ==============================
           RETIRO EN CORREO
      =============================== -->

      <div class="shipping-card">

  <div class="shipping-option">
    <div>

      <strong>🏤 Retiro en Correo Argentino</strong>

      <p>
        ${data.retirePoints.length}
        sucursales disponibles
      </p>

      <div class="agency-list">
        ${data.retirePoints
      .map(
        (sucursal) => `
          
          <label class="agency-option" for="agency-${sucursal.agency_id}">
            
            <input
              name="shippingType"
              id="agency-${sucursal.agency_id}"
              type="radio"
              value="${sucursal.agency_id}"
            >

            <span>${sucursal.agency}</span>

          </label>

        `
      )
      .join("")}
      </div>

    </div>
  </div>

  <div id="agencyContainer"></div>

</div>

    </div>
  `;

  const agencyContainer = document.getElementById("agencyContainer");

  const shippingOptions = shippingResult.querySelectorAll(
    'input[name="shippingType"]'
  );

  shippingOptions.forEach((option) => {
    option.addEventListener("change", () => {
      // =====================================
      // LIMPIAR ELEMENTOS
      // =====================================

      if (agencyContainer) {
        agencyContainer.innerHTML = "";
      }

      clearOtherDeliveryOptions(option);

      // =====================================
      // DOMICILIO
      // =====================================

      if (option.value === "home") {
        setSelectedShipping({
          postalCode,
          province: data.province,
          type: "home",
          price: Number(data.homePrice),
        });

        renderHomeFields();

        return;
      }

      // =====================================
      // AGENCIA
      // =====================================

      setSelectedShipping({
        agency: option.value,
        type: "agency",
        price: Number(data.price),
      });
    });
  });

  // =====================================
  // SELECCIÓN INICIAL DOMICILIO
  // (solo si no eligió Casa Central, Sucursal o cadete)
  // =====================================

  const alreadySelected = document.querySelector(
    'input[name="localBranch"]:checked, input[name="shippingType"]:checked'
  );

  if (alreadySelected) return;

  const homeRadio = shippingResult.querySelector(
    'input[name="shippingType"][value="home"]'
  );

  homeRadio.checked = true;

  setSelectedShipping({
    postalCode,
    province: data.province,
    type: "home",
    price: Number(data.homePrice),
  });

  renderHomeFields();
}

function renderProducts() {
  summaryProducts.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item) => {
    const unitPrice = getItemUnitPrice(item, paymentMethod == "card");
    subtotal += unitPrice * item.qty;
    summaryProducts.innerHTML += `
                    <div class="summary-item">
                      <img src="${item.image}" loading="lazy" />

                      <div class="summary-item-info">
                        <h3>${item.name}</h3>

                        <p>
                          Cantidad: ${item.qty}
                          ${item.varity
        ? `${item.varity.color || ""} ${item.varity.type || ""}`
        : ""
      }
                          ${(item.promotionData?.defaultSelected || [])
        .filter((d) => d.select)
        .map(
          (d) =>
            `<br>${d.productName || ""}: ${d.select.color || ""} ${d.select.type || ""
            }`
        )
        .join("")}
                          ${item.engraved ? "<br>Con grabado" : ""}
                        </p>
                      </div>

                      <div class="summary-item-price">
                        $${(unitPrice * item.qty).toLocaleString("es-AR")}
                      </div>
                    </div>
                    `;
  });

  updateSummary(subtotal);
}

renderProducts();

window.MPTrack?.beginCheckout(cart);

/* =========================
   DELIVERY
========================= */

deliveryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    deliveryBtns.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    deliveryMethod = btn.dataset.delivery;

    if (deliveryMethod === "shipping") {
      shippingFields.classList.remove("hidden");

      // Mostrar las opciones disponibles antes
      // de ingresar el código postal
      renderPreShippingOptions();
    } else {
      shippingFields.classList.add("hidden");
    }
  });
});
/* =========================
   PAYMENT
========================= */

paymentBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    paymentBtns.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    paymentMethod = btn.dataset.payment;

    if (paymentMethod === "card") {
      cardFields.classList.remove("hidden");
    } else {
      cardFields.classList.add("hidden");
    }

    renderProducts()

    trackPaymentInfo();
  });
});

/* =========================
   COPY
========================= */

copyAliasBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(paymentAlias.value);

  copyAliasBtn.textContent = "Copiado";

  setTimeout(() => {
    copyAliasBtn.textContent = "Copiar";
  }, 2000);
});

copyCVUBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(paymentCVU.value);

  copyCVUBtn.textContent = "Copiado";

  setTimeout(() => {
    copyCVUBtn.textContent = "Copiar";
  }, 2000);
});

copyAmountBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(paymentTransferAmount.value);

  copyAmountBtn.textContent = "Copiado";

  setTimeout(() => {
    copyAmountBtn.textContent = "Copiar";
  }, 2000);
});

/* =========================
   CREATE ORDER
========================= */

function createCardToken() {
  return new Promise((resolve, reject) => {
    const form = document.getElementById("cardForm");

    if (!form) {
      reject(new Error("No se encontró el formulario cardForm"));
      return;
    }

    try {
      decidir.createToken(form, (status, response) => {
        if (status !== 200 && status !== 201) {
          const validationErrors = response?.validation_errors;

          if (validationErrors?.length) {
            validationErrors.forEach((err, index) => { });
          } else {
          }

          reject(
            response || {
              status,
              message: "Payway no pudo generar el token",
            }
          );

          return;
        }

        if (!response?.id) {
          reject(
            new Error(
              "Payway respondió correctamente pero no devolvió un token."
            )
          );
          return;
        }

        resolve(response.id);
      });
    } catch (error) {
    }
  });
}

confirmOrderBtn.addEventListener("click", async () => {
  try {
    loadingOverlay.classList.remove("hidden");

    confirmOrderBtn.disabled = true;
    confirmOrderBtn.textContent = "Procesando...";

    const name = document.getElementById("name").value;

    const surname = document.getElementById("surname").value;

    const email = document.getElementById("email").value;

    const phone = document.getElementById("phone").value;

    const dni = document.getElementById("customerDni").value;

    if (!name || !surname || !email || !phone) {
      alert("Completá todos los campos");
      loadingOverlay.classList.add("hidden");
      return;
    }

    const subtotal = getSubtotal();
    const shipping = selectedShipping;

    if (deliveryMethod === "shipping" && !shipping) {
      alert("Seleccioná un método de envío.");
      return;
    }

    if (selectedShipping) {
      const provinceInput = document.getElementById("shippingProvince");
      const cityInput = document.getElementById("shippingCity");
      const streetInput = document.getElementById("shippingStreet");

      if (provinceInput) {
        selectedShipping.provinceName = provinceInput.value.trim();
      }

      if (cityInput) {
        selectedShipping.city = cityInput.value.trim();
      }

      if (streetInput) {
        selectedShipping.street = streetInput.value.trim();
      }
    }

    let shippingPrice = 0;

    if (shipping) {
      shippingPrice = shipping.price || 0;

      // Envío gratis
      if (subtotal >= 80000) {
        shippingPrice = 0;
      }
    }

    const total = subtotal + shippingPrice;

    /* =========================
       PRODUCTS FORMAT
    ========================= */
    const isPromotion = (item) => Boolean(item.promotion && item.promotionData);

    const products = cart
      .filter((item) => !isPromotion(item))
      .map((item) => {
        const product = {
          quantity: item.qty,
          productId: item.id,
          custom: item.engraved ? item.qty : null,
        };

        if (item.varity) {
          product.varity = item.varity;
        }

        return product;
      });

    /* =========================
       PROMOTIONS FORMAT
    ========================= */
    const promotionId = cart.filter(isPromotion).map((item) => ({
      ...item.promotionData,
      quantity: item.qty,
      custom: item.engraved ? item.qty : null,
    }));

    /* =========================
   DELIVERY
========================= */

    const recipient = {
      email,
      name,
      surname,
      phone: Number(phone),
      dni: String(dni),
    };
    /* =========================
   RECIPIENT
========================= */

    /* =========================
   ADDRESS
========================= */

    const provinceName =
      document.getElementById("shippingProvince")?.value.trim() || "";

    const city =
      document.getElementById("shippingCity")?.value.trim() ||
      selectedShipping?.city ||
      "";

    const street =
      document.getElementById("shippingStreet")?.value.trim() || "";

    const streetMatch = street.match(/^(.*?)(\d+)?$/);

    const streetName = streetMatch ? streetMatch[1].trim() : street;

    const streetNumber =
      streetMatch && streetMatch[2] ? Number(streetMatch[2]) : 0;

    const address = {
      city,

      postalCode: selectedShipping?.postalCode || "",

      streetName,

      provinceCode: "",

      provinceName,

      streetNumber,
    };

    /* =========================
   DELIVERY
========================= */

    let delivered;

    switch (selectedShipping.type) {
      case "home":
        delivered = {
          method:
            "Correo Argentino Shipping - Correo Argentino Clasico - Envío a domicilio",

          price: shippingPrice,

          recipient,

          shipping: {
            deliveryType: "homeDelivery",

            address,
          },

          otherRecipient: null,
        };

        break;

      case "agency":
        delivered = {
          method:
            "Correo Argentino Shipping - Correo Argentino Clasico - Envío a sucursal",

          price: shippingPrice,

          recipient,

          shipping: {
            deliveryType: "agency",
            agency: selectedShipping.agency,
          },

          otherRecipient: null,
        };

        break;

      case "cadete":
        delivered = {
          method: "Cadete",

          price: shippingPrice,

          recipient,

          shipping: {
            address,
          },

          otherRecipient: null,
        };

        break;

      case "Casa Central":
        delivered = {
          method: "Sucursal Casa Central",
          price: 0,
          recipient,
          otherRecipient: null,
        };
        break;

      case "Sucursal Urquiza":
        delivered = {
          method: "Sucursal Urquiza",
          price: 0,
          recipient,
          otherRecipient: null,
        };

        break;
    }

    /* =========================
       ORDER BODY
    ========================= */

    if (deliveryMethod === "shipping" && !selectedShipping) {
      alert("Primero calculá y seleccioná un método de envío.");
      return;
    }
    const totalValue = summaryTotalValue;

    const orderBody = {
      userId: user?.id || null,
      cartId: backendCartId,
      channel: "web",
      products,
      amount: totalValue,
      paymentMethod: paymentMethod === "transfer" ? "transfer" : "card",
      paymentStatus: "pending",
      delivered,
      timeDelivered: "Una semana",
    };

    if (promotionId.length) {
      orderBody.promotionId = promotionId;
    }

    /* =========================
       CREATE ORDER
    ========================= */

    if (
      delivered.method == "Cadete" &&
      !delivered.shipping.address.streetName
    ) {
      alert("Colocar dirección de envío");
    }

    // Si el usuario no tocó el medio de pago (transferencia por defecto)
    trackPaymentInfo();

    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(orderBody),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error creando orden");
    }

    const createdOrder = data.order;

    localStorage.setItem("trackingToken", data.trackingToken);

    localStorage.setItem("lastOrderId", createdOrder.id);

    // Datos para el evento "purchase" (se dispara en esperando-pago
    // cuando el pago queda confirmado)
    window.MPTrack?.savePendingPurchase({
      transactionId: createdOrder.id,
      cart,
      useCardPrice: paymentMethod === "card",
      shipping: getTrackedShippingCost(),
      email,
      phone,
    });

    if (paymentMethod === "card") {
      const token = await createCardToken();

      const cardNumber = document.getElementById("cardNumber").value;

      const paymentInfo = getPaymentData(cardNumber);

      if (!paymentInfo) {
        throw new Error("Tarjeta no soportada");
      }

      const paymentRes = await fetch(
        `${API_BASE}/orders/process-payment-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: createdOrder.id,
            token,
            paymentId: paymentInfo.paymentId,
          }),
        }
      );

      const paymentResult = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(
          paymentResult.message ||
          paymentResult.error ||
          JSON.stringify(paymentResult)
        );
      }


      localStorage.removeItem("cart");

      localStorage.setItem("lastOrder", JSON.stringify(createdOrder));

      // Indicamos que venimos de un pago con tarjeta aprobado
      localStorage.setItem("paymentConfirmed", "true");

      window.location.href = "esperando-pago.html";
    }

    /* =========================
       TRANSFER
    ========================= */

    if (paymentMethod === "transfer") {
      const aliasRes = await fetch(
        `${API_BASE}/orders/create-alias-transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: createdOrder.id,
          }),
        }
      );

      const aliasData = await aliasRes.json();
      localStorage.setItem("transferInfo", JSON.stringify(aliasData));

      if (!aliasRes.ok && aliasRes.status !== 409) {
        throw new Error(
          aliasData.error || "No se pudo obtener la información de pago"
        );
      }
      window.location.href = "esperando-pago.html";
    }

    /* =========================
       CLEAN CART
    ========================= */

    localStorage.removeItem("cart");

    /* =========================
       SAVE LAST ORDER
    ========================= */

    localStorage.setItem("lastOrder", JSON.stringify(createdOrder));

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  } catch (err) {
    alert(err?.message || JSON.stringify(err) || "Error desconocido");
  } finally {
    loadingOverlay.classList.add("hidden");

    confirmOrderBtn.disabled = false;
    confirmOrderBtn.textContent = "Confirmar compra";
  }
});

/* =========================
   PAGO CON TARJETA
========================= */

function getPaymentData(cardNumber) {
  const number = cardNumber.replace(/\s/g, "");

  if (number.startsWith("4")) {
    return {
      brand: "Visa",
      paymentId: 1,
    };
  }

  if (/^5[1-5]/.test(number)) {
    return {
      brand: "MasterCard",
      paymentId: 104,
    };
  }

  if (number.startsWith("34") || number.startsWith("37")) {
    return {
      brand: "American Express",
      paymentId: 65,
    };
  }

  return null;
}

/* =========================
   DETECTAR MARCA
========================= */

const cardNumberInput = document.getElementById("cardNumber");

const cardBrandInput = document.getElementById("cardBrand");

if (cardNumberInput && cardBrandInput) {
  cardNumberInput.addEventListener("input", () => {
    const paymentInfo = getPaymentData(cardNumberInput.value);

    if (paymentInfo) {
      cardBrandInput.value = paymentInfo.brand;
    } else {
      cardBrandInput.value = "";
    }
  });
}
