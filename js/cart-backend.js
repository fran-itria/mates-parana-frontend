const CARTS_URL = "https://matesparana-backend-production.up.railway.app/carts";

async function createCartIfNotExists() {
  if (!user) {
    window.location.href = "login.html";
  }

  if (cart.length === 0) {
    window.location.href = "index.html";
  }
  const user = JSON.parse(localStorage.getItem("user"));
  let cartId = localStorage.getItem("backendCartId");

  if (cartId) {
    // ya existe carrito, actualizo actividad
    await updateCartActivity(cartId);
    return cartId;
  }

  // crear carrito nuevo
  const res = await fetch(CARTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: user.id }),
  });

  const data = await res.json();

  localStorage.setItem("backendCartId", data.id);
  return data.id;
}

async function updateCartActivity(cartId) {
  await fetch(`${CARTS_URL}/actividad`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: cartId }),
  });
}
