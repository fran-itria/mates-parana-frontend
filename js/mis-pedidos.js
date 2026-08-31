const API_BASE = "https://matesparana-backend-production.up.railway.app";
const token = localStorage.getItem("token");
const ordersContainer = document.getElementById("ordersContainer");

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      ordersContainer.innerHTML = "<p>No estás logueado o hubo un error.</p>";
      return;
    }

    if (!data.orders.length) {
      ordersContainer.innerHTML = "<p>No tenés pedidos todavía.</p>";
      return;
    }

    ordersContainer.innerHTML = "";

    data.orders.forEach((order) => {
      ordersContainer.innerHTML += `
        <div class="order-card">
          <h3>Orden #${order.orderNumber}</h3>
          <p><strong>Estado:</strong> ${order.state}</p>
          <p><strong>Total:</strong> $${order.amount.toLocaleString(
            "es-AR"
          )}</p>
          <p><strong>Fecha:</strong> ${new Date(
            order.createdAt
          ).toLocaleDateString()}</p>
        </div>
      `;
    });
  } catch (err) {
    ordersContainer.innerHTML = "<p>Error de conexión.</p>";
  }
}

if (!token) {
  ordersContainer.innerHTML =
    "<p>Tenés que iniciar sesión para ver tus pedidos.</p>";
} else {
  loadOrders();
}
