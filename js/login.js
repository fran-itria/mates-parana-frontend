const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/user/login`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "mi-cuenta.html";
  } catch (err) {
    alert(err.message);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    user: document.getElementById("registerUser").value,
    name: document.getElementById("registerName").value,
    surname: document.getElementById("registerSurname").value,
    email: document.getElementById("registerMail").value,
    password: document.getElementById("registerPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);
    if (!res.ok) throw new Error("Error al crear usuario");

    alert("Usuario creado, ahora podés iniciar sesión");
  } catch (err) {
    alert(err.message);
  }
});
