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

console.log("=================================");
console.log("ESPERANDO-PAGO INICIADO");
console.log("=================================");

console.log("LAST ORDER:", lastOrder);
console.log("LAST ORDER ID:", lastOrderId);
console.log("PAYMENT CONFIRMED:", paymentConfirmed);
console.log("SHIPPING:", shipping);
console.log("TRANSFER INFO:", transferInfo);

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
  console.log("🚀 INICIANDO PÁGINA DE PEDIDO");

  try {
    /* =====================================================
       OBTENER ORDEN ACTUALIZADA DESDE EL BACKEND
    ===================================================== */

    console.log("🔎 OBTENIENDO ORDEN DESDE BACKEND...");
    console.log("🧪 PRUEBA DIRECTA FETCH");

    fetch(`${API_BASE}/orders/oneOrder/${lastOrderId}`)
      .then((res) => {
        console.log("🧪 STATUS DIRECTO:", res.status);
        return res.text();
      })
      .then((data) => {
        console.log("🧪 RESPUESTA DIRECTA:", data);
      })
      .catch((error) => {
        console.error("🧪 ERROR FETCH DIRECTO:", error);
      });

    const order = await obtenerOrdenActualizada();

    console.log("✅ ORDEN RECIBIDA DEL BACKEND:", order);
    console.log("🛒 PRODUCTOS DE LA ORDEN:", order.products);

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
      console.log("💳 ORDEN CON TARJETA");

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
      console.log("🏦 ORDEN CON TRANSFERENCIA");

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
        console.log("✅ TRANSFERENCIA YA CONFIRMADA");

        mostrarPagoAprobado();

        localStorage.removeItem("trackingToken");
        localStorage.removeItem("transferInfo");

        return;
      }

      /* ===================================================
         PAGO PENDIENTE
      =================================================== */

      console.log("⏳ TRANSFERENCIA PENDIENTE");

      mostrarPagoPendiente();

      /* ===================================================
         SOCKET
      =================================================== */

      if (trackingToken) {
        console.log("🔌 CONECTANDO SOCKET...");

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
  console.log("🎨 MOSTRANDO ORDEN:", order);

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
      paymentMethod.textContent = "Tarjeta";
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

  if (deliveryMethod) {
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

  console.log("🏦 MOSTRANDO DATOS DE TRANSFERENCIA:", transferInfo);

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
  console.log("🔌 CONECTANDO SOCKET...");

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
    console.log("✅ SOCKET CONECTADO");

    console.log("SOCKET ID:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ ERROR SOCKET:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 SOCKET DESCONECTADO:", reason);
  });

  socket.on("order:payment-approved", async (event) => {
    console.log("💰 EVENTO DE PAGO:", event);

    /*
     * Verificar que el evento
     * pertenece a esta orden.
     */

    if (String(event.orderId) !== String(lastOrderId)) {
      console.log("⚠️ Evento de otra orden.");

      return;
    }

    try {
      /*
       * Ahora sí consultamos nuevamente
       * al backend.
       */

      const order = await obtenerOrdenActualizada();

      console.log("🔄 ORDEN ACTUALIZADA:", order);

      localStorage.setItem("lastOrder", JSON.stringify(order));

      /*
       * Actualizar toda la pantalla.
       */

      mostrarOrden(order);

      if (
        order.paymentStatus === "approved" ||
        order.paymentStatus === "received"
      ) {
        console.log("✅ PAGO CONFIRMADO");

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
  console.log("🔎 BUSCANDO ORDEN:", lastOrderId);
  const url = `${API_BASE}/orders/oneOrder/${lastOrderId}`;
  console.log("🌐 URL:", url);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("📡 STATUS:", res.status);
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    const data = await res.json();
    console.log("📦 RESPUESTA COMPLETA:", data);
    /* * El backend puede devolver: * * { * order: {...} * } * * o directamente: * * { * id: "...", * products: [...] * } */ const order =
      data.order ?? data;
    console.log("✅ ORDEN FINAL PARA MOSTRAR:", order);
    return order;
  } catch (error) {
    console.error("❌ ERROR OBTENIENDO LA ORDEN:", error);
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
  console.log("🛒 PRODUCTS RECIBIDOS:", products);
  console.log("🛒 PRODUCTS JSON:", JSON.stringify(products, null, 2));
  const container = document.getElementById("orderProducts");

  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(products) || !products.length) {
    container.innerHTML = "<p>No se encontraron productos.</p>";

    return;
  }

  products.forEach((item) => {
    const quantity = item.quantity || item.qty || 1;

    const product = item.product || item;

    const name = product.name || item.name || item.productName || "Producto";

    const price = Number(
      item.cardPrice ?? item.price ?? product.cardPrice ?? product.price ?? 0
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

          ${
            varietyHTML
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

  if (order.shippingPrice !== undefined) {
    shippingPrice = Number(order.shippingPrice || 0);
  } else if (
    order.delivered &&
    typeof order.delivered === "object" &&
    order.delivered.price !== undefined
  ) {
    shippingPrice = Number(order.delivered.price || 0);
  } else if (shipping) {
    shippingPrice = Number(shipping.price || 0);
  }

  const subtotal = Math.max(0, total - shippingPrice);

  const subtotalElement = document.getElementById("orderSubtotal");

  const shippingElement = document.getElementById("orderShipping");

  const totalElement = document.getElementById("orderTotal");

  if (subtotalElement) {
    subtotalElement.textContent = "$" + subtotal.toLocaleString("es-AR");
  }

  if (shippingElement) {
    shippingElement.textContent =
      shippingPrice === 0
        ? "Gratis"
        : "$" + shippingPrice.toLocaleString("es-AR");
  }

  if (totalElement) {
    totalElement.textContent = "$" + total.toLocaleString("es-AR");
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

    if (delivered.method === "Sucursal Casa Central") {
      return "Retiro en Sucursal";
    }

    if (delivered.method === "Cadete") {
      return "Envío por cadete";
    }

    if (delivered.method) {
      return delivered.method;
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
