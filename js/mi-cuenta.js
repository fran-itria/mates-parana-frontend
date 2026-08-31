const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const nameInput = document.getElementById("nameInput");
const userInput = document.getElementById("userInput");
const surnameInput = document.getElementById("surnameInput");
const mailInput = document.getElementById("mailInput");
const phoneInput = document.getElementById("phoneInput");
const saveBtn = document.getElementById("saveBtn");
const logoutBtn = document.getElementById("logoutBtn");

async function loadUser() {
  const res = await fetch(`${API_URL}/user/loginwithtoken`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // token inválido / expirado
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }
  console.log(data.user);
  userInput.value = data.user.user || "";
  nameInput.value = data.user.name || "";
  surnameInput.value = data.user.surname || "";
  mailInput.value = data.user.email || "";
  phoneInput.value = data.user.phoneNumber || "";

  localStorage.setItem("user", JSON.stringify(data.user));
}

loadUser();

const ordersContainer = document.getElementById("ordersContainer");

async function loadOrders() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    const res = await fetch(
      `https://matesparana-backend-production.up.railway.app/orders/my-orders/${user.id}`
    );

    const data = await res.json();

    console.log("MIS PEDIDOS:", data);

    if (!Array.isArray(data) || data.length === 0) {
      ordersContainer.innerHTML = `
    <p class="orders-empty">
        No tienes ningún pedido aún.
    </p>
`;
      return;
    }

    ordersContainer.innerHTML = "";

    data.reverse().forEach((order) => {
      const paymentStatus = order.paymentStatus || "pending";

      const statusText =
        paymentStatus === "received"
          ? "Pago aprobado"
          : paymentStatus === "rejected"
          ? "Pago rechazado"
          : "Esperando pago";

      const statusClass =
        paymentStatus === "received"
          ? "status-received"
          : paymentStatus === "rejected"
          ? "status-rejected"
          : "status-pending";

      ordersContainer.innerHTML += `
        <div class="order-item">

          <div class="order-left">

            <div class="order-number">
              Pedido #${order.orderNumber}
            </div>

            <div class="order-date">
              ${new Date(order.createdAt).toLocaleDateString("es-AR")}
            </div>

          </div>

          <div class="order-right">

            <div class="order-status ${statusClass}">
              ${statusText}
            </div>

            <div class="order-total">
              $${Number(order.amount).toLocaleString("es-AR")}
            </div>

          </div>

        </div>
      `;
    });
  } catch (err) {
    console.error(err);

    ordersContainer.innerHTML = `
      <p class="orders-empty">
        Error cargando pedidos.
      </p>
    `;
  }
}

loadOrders();

setInterval(loadOrders, 15000);

saveBtn.addEventListener("click", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const body = {
    id: user.id,
    name: nameInput.value,
    phoneNumber: phoneInput.value,
  };

  await fetch(`${API_URL}/user`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  alert("Datos actualizados correctamente");
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});
