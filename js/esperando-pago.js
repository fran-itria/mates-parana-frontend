const API_BASE = "https://matesparana-backend-production.up.railway.app";

/* =========================================================
   LOCAL STORAGE
========================================================= */

const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

const shipping = JSON.parse(localStorage.getItem("shipping"));

const trackingToken = localStorage.getItem("trackingToken");

const lastOrderId = localStorage.getItem("lastOrderId");

const paymentConfirmed = localStorage.getItem("paymentConfirmed") === "true";

const transferInfo = JSON.parse(localStorage.getItem("transferInfo"));

/* =========================================================
   DEBUG
========================================================= */

/* =========================================================
   VALIDACIÓN
========================================================= */

if (!lastOrderId || !lastOrder) {
  console.warn("No existe lastOrder o lastOrderId");

  window.location.href = "checkout.html";
}

/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

  try {
    /* =====================================================
       OBTENER ORDEN ACTUALIZADA DESDE EL BACKEND
    ===================================================== */

    fetch(`${API_BASE}/orders/oneOrder/${lastOrderId}`)
      .then((res) => {
        return res.text();
      })
      .then((data) => {
      })
      .catch((error) => {
      });

    const order = await obtenerOrdenActualizada();

    /* =====================================================
       GUARDAR ORDEN ACTUALIZADA
    ===================================================== */

    localStorage.setItem("lastOrder", JSON.stringify(order));

    /* =====================================================
       MOSTRAR ORDEN
    ===================================================== */

    mostrarOrden(order);

    /* =====================================================
       TARJETA
    ===================================================== */

    if (order.paymentMethod === "card") {

      /*
       * El pago con tarjeta ya fue aprobado
       * antes de llegar a esta página.
       */

      mostrarPagoAprobado();

      localStorage.removeItem("paymentConfirmed");
      localStorage.removeItem("trackingToken");

      return;
    }

    /* =====================================================
       TRANSFERENCIA
    ===================================================== */

    if (order.paymentMethod === "transfer") {

      /*
       * Mostrar datos bancarios.
       */

      mostrarDatosTransferencia(order);

      /* ===================================================
         ¿YA ESTÁ PAGADA?
      =================================================== */

      if (
        order.paymentStatus === "approved" ||
        order.paymentStatus === "received"
      ) {

        mostrarPagoAprobado();

        localStorage.removeItem("trackingToken");
        localStorage.removeItem("transferInfo");

        return;
      }

      /* ===================================================
         PAGO PENDIENTE
      =================================================== */

      mostrarPagoPendiente();

      /* ===================================================
         SOCKET
      =================================================== */

      if (trackingToken) {
        conectarSocket();
      } else {
        console.warn("⚠️ NO EXISTE TRACKING TOKEN");
      }

      return;
    }

    console.warn("⚠️ MÉTODO DE PAGO DESCONOCIDO:", order.paymentMethod);
  } catch (error) {
    console.error("❌ ERROR DENTRO DE INICIAR():", error);
  }
}

/* =========================================================
   MOSTRAR ORDEN
========================================================= */

function mostrarOrden(order) {
  /* =======================================================
     NÚMERO DE PEDIDO
  ======================================================= */

  const orderNumber = document.getElementById("orderNumber");

  if (orderNumber) {
    orderNumber.textContent = "#" + (order.orderNumber || "0000");
  }

  /* =======================================================
     MÉTODO DE PAGO
  ======================================================= */

  const paymentMethod = document.getElementById("paymentMethod");

  if (paymentMethod) {
    if (order.paymentMethod === "card") {
      const p = document.createElement("p")
      const cuotes = document.createElement("p")
      p.textContent = "3 cuotas sin interés"
      p.style.marginTop = "10px"
      cuotes.textContent = `$${(order.amount / 3).toLocaleString("es-Ar")} c/u`
      cuotes.style.marginTop = "10px"
      paymentMethod.textContent = "Tarjeta";
      paymentMethod.appendChild(p)
      paymentMethod.appendChild(cuotes)
    } else if (order.paymentMethod === "transfer") {
      paymentMethod.textContent = "Transferencia";
    } else {
      paymentMethod.textContent = "-";
    }
  }

  /* =======================================================
     ENTREGA
  ======================================================= */

  const deliveryMethod = document.getElementById("deliveryMethod");

  if (order.delivered.method.includes("Correo Argentino")) {
    const split = order.delivered.method.split("-")
    const text1 = split[0].replace("Shipping", "")
    const p1 = document.createElement("p")
    p1.textContent = text1
    const p2 = document.createElement("p")
    p2.textContent = split[2]
    p2.style.marginTop = "10px"

    deliveryMethod.textContent = ""
    deliveryMethod.appendChild(p1)
    deliveryMethod.appendChild(p2)
  } else {
    deliveryMethod.textContent = obtenerTextoEntrega(order);
  }

  /* =======================================================
     ESTADO DEL PAGO
  ======================================================= */

  mostrarEstadoPago(order.paymentStatus);

  /* =======================================================
     PRODUCTOS
  ======================================================= */

  mostrarProductos(order.orderProducts || []);
  mostrarPromociones(order.promotionId || []);

  /* =======================================================
     TOTALES
  ======================================================= */

  mostrarTotales(order);
}

/* =========================================================
   ESTADO DEL PAGO
========================================================= */

function mostrarEstadoPago(status) {
  const element = document.getElementById("paymentStatus");

  if (!element) return;

  if (status === "approved" || status === "received") {
    element.textContent = "Aprobado";

    return;
  }

  if (status === "pending") {
    element.textContent = "⏳ Pendiente";

    return;
  }

  if (status === "rejected") {
    element.textContent = "❌ Rechazado";

    return;
  }

  element.textContent = status || "-";
}

/* =========================================================
   DATOS DE TRANSFERENCIA
========================================================= */

function mostrarDatosTransferencia(order) {
  const section = document.getElementById("transferSection");

  if (!section) return;

  /*
   * Mostrar sección.
   */

  section.classList.remove("hidden");

  /*
   * Verificar información.
   */

  if (!transferInfo) {
    console.warn("⚠️ No existe transferInfo");

    return;
  }

  /* =======================================================
     IMPORTE
  ======================================================= */

  const amount = Number(transferInfo.price ?? order.amount ?? 0);

  const transferAmount = document.getElementById("transferAmount");

  if (transferAmount) {
    transferAmount.textContent = "$" + amount.toLocaleString("es-AR");
  }

  /* =======================================================
     ALIAS
  ======================================================= */

  const alias = document.getElementById("transferAlias");

  if (alias) {
    alias.textContent = transferInfo.alias || "-";
  }

  /* =======================================================
   COPIAR IMPORTE Y ALIAS
======================================================= */

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.dataset.copyTarget;
      const target = document.getElementById(targetId);

      if (!target) return;

      let textToCopy = target.textContent.trim();

      // Si es el importe, eliminamos el símbolo $
      if (targetId === "transferAmount") {
        textToCopy = textToCopy.replace("$", "").trim();
      }

      try {
        await navigator.clipboard.writeText(textToCopy);

        const originalContent = button.textContent;

        button.textContent = "✓";
        button.classList.add("copied");

        setTimeout(() => {
          button.textContent = originalContent;
          button.classList.remove("copied");
        }, 1500);
      } catch (error) {
        console.error("Error al copiar:", error);
      }
    });
  });

  /* =======================================================
     CVU
  ======================================================= */

  const cvu = document.getElementById("transferCvu");

  if (cvu) {
    cvu.textContent = transferInfo.cvu || "-";
  }

  /* =======================================================
     BENEFICIARIO
  ======================================================= */

  const holder = document.getElementById("transferHolder");

  if (holder) {
    holder.textContent = transferInfo.beneficiario || "-";
  }

  /* =======================================================
     CUIT
  ======================================================= */

  const cuit = document.getElementById("transferCuit");

  if (cuit) {
    /*
     * Formateamos:
     *
     * 20433498454
     *
     * como:
     *
     * 20-43349845-4
     */

    const rawCuit = String(transferInfo.cuit || "").replace(/\D/g, "");

    if (rawCuit.length === 11) {
      cuit.textContent = `${rawCuit.slice(0, 2)}-${rawCuit.slice(
        2,
        10
      )}-${rawCuit.slice(10)}`;
    } else {
      cuit.textContent = transferInfo.cuit || "-";
    }
  }

  /* =======================================================
     VENCIMIENTO
  ======================================================= */

  const expirationContainer = document.getElementById(
    "transferExpirationContainer"
  );

  const expiration = document.getElementById("transferExpiration");

  if (transferInfo.expirationTime) {
    if (expiration) {
      expiration.textContent = transferInfo.expirationTime;
    }

    if (expirationContainer) {
      expirationContainer.classList.remove("hidden");
    }
  }
}

/* =========================================================
   PAGO APROBADO
========================================================= */

function mostrarPagoAprobado() {
  const icon = document.getElementById("orderIcon");

  const title = document.getElementById("orderTitle");

  const message = document.getElementById("orderMessage");

  const pending = document.getElementById("pendingMessage");

  if (icon) {
    icon.textContent = "✓";
  }

  if (title) {
    title.textContent = "¡Gracias por tu compra!";
  }

  if (message) {
    message.textContent =
      "Tu pago fue confirmado y estamos preparando tu pedido.";
  }

  if (pending) {
    pending.classList.add("hidden");
  }

  /*
   * Ocultar datos de transferencia
   * cuando el pago ya fue confirmado.
   */

  const transferSection = document.getElementById("transferSection");

  if (transferSection) {
    transferSection.classList.add("hidden");
  }

  /*
   * Mostrar botones.
   */

  const accountButton = document.getElementById("accountButton");

  const homeButton = document.getElementById("homeButton");

  if (accountButton) {
    accountButton.classList.remove("hidden");
  }

  if (homeButton) {
    homeButton.classList.remove("hidden");
  }
}

/* =========================================================
   PAGO PENDIENTE
========================================================= */

function mostrarPagoPendiente() {
  const icon = document.getElementById("orderIcon");

  const title = document.getElementById("orderTitle");

  const message = document.getElementById("orderMessage");

  const pending = document.getElementById("pendingMessage");

  if (icon) {
    icon.textContent = "⏳";
  }

  if (title) {
    title.textContent = "Pedido pendiente";
  }

  if (message) {
    message.textContent =
      "Tu pedido fue creado correctamente. Realizá la transferencia para confirmar tu compra.";
  }

  if (pending) {
    pending.classList.remove("hidden");
  }
}

/* =========================================================
   SOCKET
========================================================= */

function conectarSocket() {

  if (typeof io !== "function") {
    console.error("❌ Socket.IO no está cargado.");

    return;
  }

  const socket = io(`${API_BASE}/orders`, {
    auth: {
      trackingToken,
    },

    transports: ["websocket"],
  });

  socket.on("connect", () => {
  });

  socket.on("connect_error", (error) => {
  });

  socket.on("disconnect", (reason) => {
  });

  socket.on("order:payment-approved", async (event) => {
    /*
     * Verificar que el evento
     * pertenece a esta orden.
     */

    if (String(event.orderId) !== String(lastOrderId)) {
      return;
    }

    try {
      /*
       * Ahora sí consultamos nuevamente
       * al backend.
       */

      const order = await obtenerOrdenActualizada();

      localStorage.setItem("lastOrder", JSON.stringify(order));

      /*
       * Actualizar toda la pantalla.
       */

      mostrarOrden(order);

      if (
        order.paymentStatus === "approved" ||
        order.paymentStatus === "received"
      ) {

        mostrarPagoAprobado();

        localStorage.removeItem("trackingToken");

        localStorage.removeItem("transferInfo");

        socket.disconnect();
      }
    } catch (error) {
      console.error("❌ ERROR ACTUALIZANDO ORDEN:", error);
    }
  });
}

/* =========================================================
   OBTENER ORDEN ACTUALIZADA
========================================================= */

async function obtenerOrdenActualizada() {
  const url = `${API_BASE}/orders/oneOrder/${lastOrderId}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    const data = await res.json();
    /* * El backend puede devolver: * * { * order: {...} * } * * o directamente: * * { * id: "...", * products: [...] * } */ const order =
      data.order ?? data;
    return order;
  } catch (error) {
    /* * Si el backend falla pero tenemos * la orden guardada en localStorage, * usamos esa como respaldo. */ if (
      lastOrder
    ) {
      console.warn("⚠️ Usando lastOrder desde localStorage");
      /* * Por si lastOrder también viene como: * * { order: {...} } */ return (
        lastOrder.order ?? lastOrder
      );
    }
    throw error;
  }
}

/* =========================================================
   PRODUCTOS
========================================================= */

function mostrarProductos(products) {
  const container = document.getElementById("orderProducts");

  if (!container) return;

  // container.innerHTML = "";

  if (!Array.isArray(products) || !products.length) {
    container.innerHTML = "<p>No se encontraron productos.</p>";

    return;
  }

  products.filter(p => !p.promotion).forEach((item) => {
    const quantity = item.quantity || item.qty || 1;

    const product = item.product || item;

    const name = product.name || item.name || item.productName || "Producto";

    const price = Number(
      item.cardPriceWhenOrderCreated
      ??
      item.discountedPriceWhenOrderCreated
      ??
      item.priceWhenOrderCreated
      ??
      0
    );

    let varietyHTML = "";

    if (item.varity) {
      if (item.varity.type) {
        varietyHTML += `
            <span>
              Tipo: ${item.varity.type}
            </span>
          `;
      }

      if (item.varity.color) {
        varietyHTML += `
            <span>
              Color: ${item.varity.color}
            </span>
          `;
      }
    }

    const productHTML = document.createElement("div");

    productHTML.className = "order-product";

    productHTML.innerHTML = `

        <div class="product-info">

          <strong>
            ${name}
          </strong>

          ${varietyHTML
        ? `
                <div class="product-variety">
                  ${varietyHTML}
                </div>
              `
        : ""
      }

          <span>
            Cantidad: ${quantity}
          </span>

        </div>

        <strong>
          $${price.toLocaleString("es-AR")}
        </strong>

      `;

    container.appendChild(productHTML);
  });
}

function mostrarPromociones(promos) {
  const container = document.getElementById("orderProducts");

  if (!container) return;

  // container.innerHTML = "";

  if (!Array.isArray(promos) || !promos.length) {
    container.innerHTML = "<p>No se encontraron productos.</p>";

    return;
  }

  promos.forEach((item) => {
    const quantity = item.quantity || item.qty || 1;

    const product = item.product || item;

    const name = product.name || item.name || item.productName || "Producto";

    let price = 0
    if (lastOrder.paymentMethod == "transfer")
      price = Number(item.discountedPrice ?? item.price ?? 0);
    else if (lastOrder.paymentMethod == "card") {
      price = Number(item.cardPrice ?? 0);
    }

    let varietyHTML = "";

    if (item.defaultSelected.select) {
      if (item.select.type) {
        varietyHTML += `
            <span>
              Tipo: ${item.select.type}
            </span>
          `;
      }

      if (item.select.color) {
        varietyHTML += `
            <span>
              Color: ${item.select.color}
            </span>
          `;
      }
    }

    const productHTML = document.createElement("div");

    productHTML.className = "order-product";

    productHTML.innerHTML = `

        <div class="product-info">

          <strong>
            ${name}
          </strong>

          ${varietyHTML
        ? `
                <div class="product-variety">
                  ${varietyHTML}
                </div>
              `
        : ""
      }

          <span>
            Cantidad: ${quantity}
          </span>

        </div>

        <strong>
          $${price.toLocaleString("es-AR")}
        </strong>

      `;

    container.appendChild(productHTML);
  });
}

/* =========================================================
   TOTALES
========================================================= */

function mostrarTotales(order) {
  const total = Number(order.amount || 0);

  let shippingPrice = 0;

  /*
   * Primero intentamos obtener
   * el envío de la orden.
   */
  if (order.delivered.price) {
    shippingPrice = Number(order.delivered.price || 0);
  } else if (shipping) {
    shippingPrice = Number(shipping.price || 0);
  }

  const subtotal = Math.max(0, total - shippingPrice);

  const subtotalElement = document.getElementById("orderSubtotal");

  const shippingElement = document.getElementById("orderShipping");
  const shippingElementContainer = document.getElementsByClassName("summary-row");

  const totalElement = document.getElementById("orderTotal");

  if (subtotalElement) {
    subtotalElement.textContent = "$" + subtotal.toLocaleString("es-AR");
  }

  if (shippingElement && shippingPrice) {
    shippingElement.textContent = "$" + shippingPrice.toLocaleString("es-AR");
  } else {
    shippingElementContainer[1].style.visibility = "hidden"
    shippingElementContainer[1].remove()
  }

  if (totalElement) {
    totalElement.textContent = "$" + total.toLocaleString("es-AR");
    totalElement.style.paddingBlock = "0px"
  }
}

/* =========================================================
   ENTREGA
========================================================= */

function obtenerTextoEntrega(order) {
  const delivered = order.delivered;

  if (!delivered) {
    return "A coordinar";
  }

  /*
   * Si es texto.
   */

  if (typeof delivered === "string") {
    if (delivered === "pickup") {
      return "Retiro en local";
    }

    if (delivered === "shipping") {
      return "Envío";
    }

    return delivered;
  }

  /*
   * Si es objeto.
   */

  if (typeof delivered === "object") {
    /*
     * Tu backend actualmente
     * utiliza "method".
     */

    if (delivered.method == "Sucursal Casa Central" || delivered.method == "Sucursal Urquiza") {
      return `Retiro en ${delivered.method}`;
    }

    if (delivered.method === "Cadete") {
      return "Envío por cadete";
    }

    if (delivered.type === "pickup") {
      return "Retiro en local";
    }

    if (delivered.type === "shipping") {
      return "Envío";
    }

    if (delivered.name) {
      return delivered.name;
    }

    if (delivered.description) {
      return delivered.description;
    }
  }

  return "A coordinar";
}

/* =========================================================
   BOTONES
========================================================= */

document.getElementById("accountButton")?.addEventListener("click", () => {
  window.location.href = "mi-cuenta.html";
});

document.getElementById("homeButton")?.addEventListener("click", () => {
  window.location.href = "index.html";
});
