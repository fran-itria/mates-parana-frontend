document.addEventListener("DOMContentLoaded", () => {
  const miCuentaBtn = document.getElementById("miCuentaBtn");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const span = miCuentaBtn?.querySelector("span");

  if (token && user) {
    miCuentaBtn.href = "mi-cuenta.html";

    if (span) {
      span.textContent = user.name;
    }
  } else {
    miCuentaBtn.href = "login.html";

    if (span) {
      span.textContent = "Mi cuenta";
    }
  }

  /*=======HADER SCROLL============= */
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");

    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  /*MENU HAMBURGUESA */

  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("open");

      // Si acabamos de cerrar el menú principal
      if (!nav.classList.contains("open")) {
        // Reiniciar PRODUCTOS
        productosPrimerToque = false;

        // Cerrar también el mega-menú
        megaMenu.classList.remove("active");
      }
    });
  }

  /*==========================================================================*/

  /* ===================== BUSCADOR GLOBAL ===================== */

  let globalProducts = [];

  const API_URL =
    "https://matesparana-backend-production.up.railway.app/products?sort=createdAt_desc";
  async function loadProductsForSearch() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      globalProducts = data.products
        .filter((p) => p.active)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.discountedPrice ?? p.price,
          image: (p.image?.[0] || "").replace(/\s/g, ""),
          category: inferCategory(p), // 👈 CLAVE
          raw: p,
        }));
    } catch (err) {}

    buildMegaMenu(globalProducts);
  }

  loadProductsForSearch();

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // Tracking: la búsqueda se registra cuando el usuario deja de escribir
  let searchTrackTimeout = null;
  let lastTrackedSearch = "";
  let lastSearchResults = [];

  function trackSearch(query, results) {
    clearTimeout(searchTrackTimeout);

    searchTrackTimeout = setTimeout(() => {
      if (query.length < 3 || query === lastTrackedSearch) return;
      lastTrackedSearch = query;

      window.MPTrack?.search(query);
      window.MPTrack?.viewItemList(
        "resultados_busqueda",
        "Resultados de búsqueda",
        results.map((p) => p.raw || p)
      );
    }, 1000);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();

      if (!query) {
        searchResults.classList.remove("active");
        return;
      }

      const results = globalProducts
        .filter((p) => p.name.toLowerCase().includes(query))
        .slice(0, 6);

      renderSearchResults(results);

      lastSearchResults = results;
      trackSearch(query, results);
    });

    searchResults?.addEventListener("click", (e) => {
      const link = e.target.closest(".search-item");
      if (!link) return;

      const index = [...searchResults.querySelectorAll(".search-item")].indexOf(
        link
      );
      const product = lastSearchResults[index];

      if (product) {
        window.MPTrack?.selectItem(
          "resultados_busqueda",
          "Resultados de búsqueda",
          product.raw || product,
          index
        );
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        searchResults.classList.remove("active");
      }
    });
  }

  function renderSearchResults(list) {
    if (!list.length) {
      searchResults.innerHTML = `<div class="no-results">No se encontraron productos</div>`;
      searchResults.classList.add("active");
      return;
    }

    searchResults.innerHTML = list
      .map(
        (p) => `
      <a href="./producto-card.html?id=${p.id}" class="search-item">
        <img src="${p.image}" loading="lazy">
        <div class="search-info">
          <div class="search-name">${p.name}</div>
          <div class="search-price">$${p.price.toLocaleString("es-AR")}</div>
        </div>
        <span class="search-arrow">›</span>
      </a>
    `
      )
      .join("");

    searchResults.classList.add("active");
  }
});

/* =================================================== */

/*==========BOTON PRODUCTOS========================= */

function buildMegaMenu() {
  const menu = document.getElementById("megaMenu");

  menu.innerHTML = `
    <div class="mega-column">
    <a class="menu-title" href="./productos.html">
        Ver todos
      </a>
      <a class="menu-title" href="./productos.html?category=Mates">
        MATES
      </a>

      <a href="./productos.html?category=Mates&type=Imperial">Imperiales</a>
      <a href="./productos.html?category=Mates&type=Camionero">Camioneros</a>
      <a href="./productos.html?category=Mates&type=Torpedo">Torpedos</a>
    </div>

    <div class="mega-column">
      <a class="menu-title" href="./productos.html?category=Bombillas">
        BOMBILLAS
      </a>

      <a class="menu-title" href="./productos.html?category=Termos">
        TERMOS
      </a>

      <a class="menu-title" href="./productos.html?category=Accesorios">
        ACCESORIOS
      </a>

      <a class="menu-title" href="./productos.html?category=Yerbas">
        YERBAS
      </a>
    </div>
    

    <div class="mega-column">
      <a class="menu-title" href="./productos.html?category=Materas%20y%20mochilas">
        MATERAS Y MOCHILAS
      </a>

      <a class="menu-title" href="./productos.html?category=Accesorios">
        COMBOS MATEROS
      </a>

    </div>
  `;
}

function inferCategory(p) {
  const name = (p.name || "").toLowerCase();
  const type = (p.type || "").toLowerCase();

  if (
    name.includes("matera") ||
    name.includes("mochila") ||
    name.includes("canasta matera") ||
    name.includes("almohada matera")
  )
    return "Materas y mochilas";

  if (name.includes("matepa") || name.includes("tapamate")) return "Accesorios";

  if (
    ["imperial", "camionero", "torpedo"].includes(type) ||
    name.includes("mate")
  )
    return "Mates";

  if (name.includes("bombilla")) return "Bombillas";
  if (name.includes("termo")) return "Termos";

  return "Accesorios";
}

/*=========================================================================
Menu botón de productos (celular)
========================================================================== */
const productosToggle = document.querySelector(".productos-toggle");
const megaMenu = document.querySelector("#megaMenu");

if (productosToggle && megaMenu) {
  productosToggle.addEventListener(
    "click",
    function (e) {
      if (window.innerWidth <= 768) {
        console.log("CLICK PRODUCTOS MOBILE");

        e.preventDefault();
        e.stopPropagation();

        megaMenu.classList.toggle("active");

        console.log("Mega menu:", megaMenu.classList.contains("active"));
      }
    },
    true
  );
}

const topbarItems = document.querySelectorAll(".topbar-item");

if (topbarItems.length > 0) {
  let currentIndex = 0;

  function cambiarTopbar() {
    const currentItem = topbarItems[currentIndex];

    // La frase actual sale hacia la izquierda
    currentItem.classList.remove("active");
    currentItem.classList.add("exit");

    // Siguiente frase
    currentIndex = (currentIndex + 1) % topbarItems.length;

    const nextItem = topbarItems[currentIndex];

    // La colocamos nuevamente a la derecha
    nextItem.classList.remove("active", "exit");

    // Forzamos la posición inicial antes de mostrarla
    nextItem.style.transform = "translateX(100%)";

    setTimeout(() => {
      // Entra desde la derecha hacia el centro
      nextItem.style.transform = "translateX(0)";
      nextItem.classList.add("active");
    }, 100);
  }

  setInterval(cambiarTopbar, 3800);
}
