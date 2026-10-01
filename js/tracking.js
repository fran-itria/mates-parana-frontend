/* =========================================================
   TRACKING ECOMMERCE (GA4 dataLayer + Meta Pixel)
   ---------------------------------------------------------
   Envía los eventos ecommerce recomendados de GA4 al
   dataLayer (los levanta GTM) y, en paralelo, los eventos
   estándar equivalentes al Meta Pixel.

   Todo está envuelto en try/catch: si algo falla acá, la web
   (productos, carrito, checkout) sigue funcionando igual.
========================================================= */

(function () {
  const CURRENCY = "ARS";

  /*
   * Si GTM ya manda los eventos a Meta (lo configura Bakián),
   * poner esto en false para no duplicar eventos del Pixel.
   * Igual se envía el mismo eventID en ambos lados para que
   * Meta pueda deduplicar.
   */
  const SEND_META_PIXEL = true;

  // Eventos de GA4 que tienen equivalente estándar en Meta
  const META_EVENTS = {
    view_item: "ViewContent",
    search: "Search",
    add_to_cart: "AddToCart",
    add_to_wishlist: "AddToWishlist",
    begin_checkout: "InitiateCheckout",
    add_payment_info: "AddPaymentInfo",
    purchase: "Purchase",
  };

  const PURCHASE_SENT_KEY = "ga4PurchasesSent";
  const PENDING_PURCHASE_KEY = "ga4PendingPurchase";

  window.dataLayer = window.dataLayer || [];

  /* ===================== UTILS ===================== */

  function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }

  function newEventId(event) {
    return `${event}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function sumValue(items) {
    return toNumber(
      items.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0)
    );
  }

  function clean(obj) {
    Object.keys(obj).forEach((k) => {
      if (obj[k] === undefined || obj[k] === null || obj[k] === "") {
        delete obj[k];
      }
    });
    return obj;
  }

  function getCategories(p) {
    if (!p) return [];

    if (Array.isArray(p.category)) {
      return p.category
        .map((c) => (typeof c === "string" ? c : c?.name))
        .filter(Boolean);
    }

    if (typeof p.category === "string") return [p.category];

    return [];
  }

  function variantText(varity) {
    if (!varity) return "";
    return [varity.type, varity.color].filter(Boolean).join(" / ");
  }

  /* ===================== ITEMS ===================== */

  /*
   * Producto del backend (o mapeado) -> item GA4.
   * opts: { quantity, index, listId, listName, varity, isCombo, useCardPrice }
   */
  function productToItem(p, opts = {}) {
    if (!p) return null;

    const basePrice = toNumber(p.price);
    const discounted = toNumber(p.discountedPrice);
    const hasDiscount = discounted > 0 && discounted < basePrice;

    let price = hasDiscount ? discounted : basePrice;

    if (opts.useCardPrice && toNumber(p.cardPrice) > 0) {
      price = toNumber(p.cardPrice);
    }

    const item = {
      item_id: p.id != null ? String(p.id) : undefined,
      item_name: p.name,
      price,
      quantity: opts.quantity || 1,
      item_variant: variantText(opts.varity),
      index: opts.index,
      item_list_id: opts.listId,
      item_list_name: opts.listName,
    };

    if (hasDiscount && !opts.useCardPrice) {
      item.discount = toNumber(basePrice - discounted);
    }

    const categories = opts.isCombo ? ["Combos"] : getCategories(p.raw || p);

    categories.slice(0, 5).forEach((c, i) => {
      item[i === 0 ? "item_category" : `item_category${i + 1}`] = c;
    });

    return clean(item);
  }

  // Item del carrito (localStorage "cart") -> item GA4
  function cartItemToItem(c, opts = {}) {
    if (!c) return null;

    return productToItem(c, {
      quantity: opts.quantity || c.qty || 1,
      varity: c.varity,
      isCombo: Boolean(c.promotion),
      useCardPrice: opts.useCardPrice,
    });
  }

  function cartToItems(cart, opts = {}) {
    return (cart || []).map((c) => cartItemToItem(c, opts)).filter(Boolean);
  }

  /* ===================== PUSH ===================== */

  function sendMetaPixel(event, ecommerce, eventId) {
    if (!SEND_META_PIXEL || typeof window.fbq !== "function") return;

    const metaEvent = META_EVENTS[event];
    if (!metaEvent) return;

    const params = {};

    if (event === "search") {
      params.search_string = ecommerce.search_term;
    } else {
      const items = ecommerce.items || [];
      params.content_ids = items.map((i) => i.item_id).filter(Boolean);
      params.content_type = "product";
      params.contents = items.map((i) => ({
        id: i.item_id,
        quantity: i.quantity,
        item_price: i.price,
      }));
      params.num_items = items.reduce((a, i) => a + (i.quantity || 1), 0);
      params.value = ecommerce.value;
      params.currency = ecommerce.currency || CURRENCY;

      if (items.length === 1) params.content_name = items[0].item_name;
    }

    window.fbq("track", metaEvent, params, { eventID: eventId });
  }

  function push(event, ecommerce, extra = {}) {
    try {
      const eventId = newEventId(event);

      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event,
        event_id: eventId,
        ecommerce,
        ...extra,
      });

      sendMetaPixel(event, ecommerce, eventId);
    } catch (e) {
      // Nunca romper la web por el tracking
    }
  }

  function safe(fn) {
    return function () {
      try {
        return fn.apply(null, arguments);
      } catch (e) {}
    };
  }

  function withValue(items, extra = {}) {
    return {
      currency: CURRENCY,
      value: sumValue(items),
      ...extra,
      items,
    };
  }

  /* ===================== TELÉFONO ===================== */

  // Normaliza a formato internacional argentino: +549XXXXXXXXXX
  function normalizePhone(raw) {
    let digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";

    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("54")) return `+${digits}`;
    if (digits.startsWith("0")) digits = digits.slice(1);

    return digits.length === 10 ? `+549${digits}` : `+54${digits}`;
  }

  /* ===================== PURCHASE (1 vez por orden) ===================== */

  function purchasesSent() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PURCHASE_SENT_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function markPurchaseSent(id) {
    try {
      const ids = purchasesSent().filter((x) => x !== id);
      ids.push(id);
      localStorage.setItem(PURCHASE_SENT_KEY, JSON.stringify(ids.slice(-20)));
    } catch (e) {}
  }

  /* ===================== API PÚBLICA ===================== */

  window.MPTrack = {
    productToItem,
    cartToItems,
    normalizePhone,

    viewItemList: safe((listId, listName, products, opts = {}) => {
      const items = (products || [])
        .map((p, i) =>
          productToItem(p, {
            index: (opts.startIndex || 0) + i,
            listId,
            listName,
            isCombo: opts.isCombo,
          })
        )
        .filter(Boolean);

      if (!items.length) return;

      push("view_item_list", {
        item_list_id: listId,
        item_list_name: listName,
        items,
      });
    }),

    selectItem: safe((listId, listName, product, index, opts = {}) => {
      const item = productToItem(product, {
        index,
        listId,
        listName,
        isCombo: opts.isCombo,
      });
      if (!item) return;

      push("select_item", {
        item_list_id: listId,
        item_list_name: listName,
        items: [item],
      });
    }),

    viewItem: safe((product, opts = {}) => {
      const item = productToItem(product, opts);
      if (!item) return;
      push("view_item", withValue([item]));
    }),

    search: safe((term) => {
      if (!term) return;
      push("search", { search_term: term });
    }),

    viewPromotion: safe((promo) => {
      push("view_promotion", clean({ ...promo }));
    }),

    selectPromotion: safe((promo) => {
      push("select_promotion", clean({ ...promo }));
    }),

    // cartItem: item del carrito; quantity: unidades agregadas
    addToCart: safe((cartItem, quantity) => {
      const item = cartItemToItem(cartItem, { quantity });
      if (!item) return;
      push("add_to_cart", withValue([item]));
    }),

    removeFromCart: safe((cartItem, quantity) => {
      const item = cartItemToItem(cartItem, { quantity });
      if (!item) return;
      push("remove_from_cart", withValue([item]));
    }),

    viewCart: safe((cart) => {
      const items = cartToItems(cart);
      if (!items.length) return;
      push("view_cart", withValue(items));
    }),

    beginCheckout: safe((cart, coupon) => {
      const items = cartToItems(cart);
      if (!items.length) return;
      push("begin_checkout", withValue(items, clean({ coupon })));
    }),

    addShippingInfo: safe((cart, shippingTier, opts = {}) => {
      const items = cartToItems(cart, opts);
      if (!items.length) return;
      push(
        "add_shipping_info",
        withValue(items, clean({ shipping_tier: shippingTier }))
      );
    }),

    addPaymentInfo: safe((cart, paymentType, opts = {}) => {
      const items = cartToItems(cart, opts);
      if (!items.length) return;
      push(
        "add_payment_info",
        withValue(items, clean({ payment_type: paymentType }))
      );
    }),

    /*
     * Se llama en el checkout justo antes de redirigir a
     * esperando-pago.html: guarda los datos de la compra
     * para disparar "purchase" cuando el pago se confirme.
     */
    savePendingPurchase: safe((data) => {
      localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(data));
    }),

    /*
     * Dispara "purchase" una sola vez por transaction_id,
     * usando los datos guardados en el checkout.
     */
    purchaseFromPending: safe((transactionId) => {
      const id = String(transactionId || "");
      if (!id) return;
      if (purchasesSent().includes(id)) return;

      let pending = null;
      try {
        pending = JSON.parse(localStorage.getItem(PENDING_PURCHASE_KEY));
      } catch (e) {}

      if (!pending || String(pending.transactionId) !== id) return;

      const items = cartToItems(pending.cart, {
        useCardPrice: pending.useCardPrice,
      });
      if (!items.length) return;

      const ecommerce = clean({
        transaction_id: id,
        value: sumValue(items),
        tax: 0,
        shipping: toNumber(pending.shipping),
        currency: CURRENCY,
        coupon: pending.coupon,
        items,
      });

      const userData = clean({
        email: (pending.email || "").trim().toLowerCase(),
        phone_number: normalizePhone(pending.phone),
      });

      markPurchaseSent(id);
      push("purchase", ecommerce, { user_data: userData });

      try {
        localStorage.removeItem(PENDING_PURCHASE_KEY);
      } catch (e) {}
    }),
  };
})();
