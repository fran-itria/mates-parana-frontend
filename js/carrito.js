document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://matesparana-backend-production.up.railway.app";

  // USER ID de prueba (hasta que tengas login real)
  const user = JSON.parse(localStorage.getItem("user"));
  const USER_ID = user?.id || null;

  let backendCartId = localStorage.getItem("backendCartId");
  const cartButton = document.getElementById("cartButton");

  if (!cartButton) {
    return;
  }
  const cartPanel = document.getElementById("cartPanel");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCart = document.getElementById("closeCart");

  const cartContent = document.getElementById("cartContent");
  const cartSubtotal = document.getElementById("cartSubtotal");

  const cartTotalBottom = document.getElementById("cartTotalBottom");
  const cartShipping = document.getElementById("cartShipping");
  const cartShippingLabel = document.getElementById("cartShippingLabel");

  const cartShippingRow = document.getElementById("cartShippingRow");
  const cartCount = document.getElementById("cartCount");
  const freeShipping = document.getElementById("freeShipping");

  if (!cartContent || !cartSubtotal || !cartTotalBottom) {
    return;
  }

  async function ensureBackendCart() {
    if (backendCartId) return backendCartId;

    const res = await fetch(`${API_BASE}/carts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    backendCartId = data.id;
    localStorage.setItem("backendCartId", backendCartId);

    return backendCartId;

    if (!USER_ID) {
      return null;
    }
  }

  function touchBackendCart() {
    const cartId = localStorage.getItem("backendCartId");
    if (!cartId) return;

    fetch(`${API_BASE}/carts/actividad`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cartId }),
    }).catch((err) => {
    });
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let shipping = JSON.parse(localStorage.getItem("shipping"));

  if (cartButton && cartPanel && cartOverlay) {
    cartButton.addEventListener("click", () => {
      if (cartPanel.classList.contains("active")) {
        close();
      } else {
        cartPanel.classList.add("active");
        cartOverlay.classList.add("active");
      }
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", close);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", close);
  }

  function close() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    cartContent.innerHTML = "";

    if (cart.length === 0) {
      cartContent.innerHTML = `<p>El carrito de compras está vacío.</p>`;
      cartSubtotal.textContent = "$0";
      cartTotalBottom.textContent = "$0";
      cartTotalBottom.textContent = "$0";
      if (cartCount) {
        cartCount.textContent = 0;
      }
      freeShipping.classList.add("hidden");
      return;
    }

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach((item) => {
      subtotal += (item.discountedPrice || item.price) * item.qty;
      totalItems += item.qty;

      cartContent.innerHTML += `
          <div class="cart-item">
            <img src="${item.image}" />
            <div class="cart-item-info">
              <strong>${item.name}</strong>
    ${item.varity
          ? `<small>${item.varity.type || ""} ${item.varity.color || ""}</small>`
          : ""
        }
    ${(item.promotionData?.defaultSelected || [])
          .filter((d) => d.select)
          .map(
            (d) =>
              `<small>${d.productName || ""}: ${d.select.type || ""} ${d.select.color || ""
              }</small>`
          )
          .join("")}
              <p>$${(item.discountedPrice || item.price)}</p>

              <div class="qty-controls">
                <button onclick="changeQty('${item.cartKey}', -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty('${item.cartKey}', 1)">+</button>
              </div>

              <span class="delete-item" onclick="removeItem('${item.cartKey
        }')">Borrar</span>
            </div>
          </div>
        `;
    });

    cartSubtotal.textContent = `$${subtotal.toLocaleString("es-AR")}`;

    const total = subtotal;

    cartTotalBottom.textContent = `$${total.toLocaleString("es-AR")}`;
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  window._addToCartInternal = async function (product) {
    await ensureBackendCart();

    // Los combos personalizados se diferencian por la variedad elegida
    // de cada uno de sus productos
    const promotionKey = (product.promotionData?.defaultSelected || [])
      .map(
        (d) =>
          `${d.productId}:${d.select?.type || ""}:${d.select?.color || ""}`
      )
      .join("|");

    const cartKey = `${product.id}-${product.varity?.type || ""}-${product.varity?.color || ""
      }${promotionKey ? `-${promotionKey}` : ""}`;

    const existing = cart.find((p) => p.cartKey === cartKey);

    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      cart.push({
        cartKey,
        id: product.id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        cardPrice: product.cardPrice,
        image: product.image,
        varity: product.varity || null,
        qty: product.qty || 1,
        promotion: product.promotion || false,
        promotionData: product.promotionData || null,
      });
    }

    touchBackendCart();
    saveCart();


    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
  };
  window.addToCart = function (product) {
    // si el carrito todavía no está listo, esperar
    if (!window._addToCartInternal) {
      setTimeout(() => window.addToCart(product), 100);
      return;
    }

    window._addToCartInternal(product);
  };

  window.changeQty = function (cartKey, amount) {
    const item = cart.find((p) => p.cartKey === cartKey);

    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
      cart = cart.filter((p) => p.cartKey !== cartKey);
    }

    touchBackendCart();
    saveCart();
  };

  window.removeItem = function (cartKey) {
    cart = cart.filter((p) => p.cartKey !== cartKey);

    touchBackendCart();
    saveCart();
  };

  const checkoutBtn = document.querySelector(".checkout-btn");

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    window.location.href = "checkout.html";
  });

  // Inicial
  renderCart();
});
