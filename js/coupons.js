document.getElementById("applyCoupon").addEventListener("click", async () => {
  const code = document.getElementById("couponInput").value.trim();
  if (!code) return;

  const checkout = JSON.parse(localStorage.getItem("checkoutData"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const body = {
    couponName: code,
    userId: USER_ID,
    amount: checkout.subtotal,
    deliveredPrice: checkout.shipping.price,
    categoriesId: [], // luego se puede mapear
    productsId: cart.map((p) => p.id),
  };

  const res = await fetch(`${API_BASE}/validar-cupon`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("couponMessage").textContent = data.message;
    return;
  }

  couponData = data;
  document.getElementById(
    "couponMessage"
  ).textContent = `Cupón aplicado: ${data.coupon.name}`;
  renderCheckout();
});
