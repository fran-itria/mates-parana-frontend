const productsGrid = document.getElementById("productsGrid");
const orderSelect = document.getElementById("orderSelect");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const filtersBtn = document.querySelector(".filters-btn");
const categoryList = document.getElementById("categoryList");
const dynamicFilters = document.getElementById("dynamicFilters");

let visibleCount = 12;
let lastRenderedCount = 0;
let products = [];
let filteredProducts = [];
let currentCategory = "all";
let currentProductName = null;

const urlParams = new URLSearchParams(window.location.search);
const categoryFromURL = urlParams.get("category");

if (categoryFromURL) {
  currentCategory = categoryFromURL;
}

/*===================================*/

/*============SLIDER 2====== */

const topbarItems = document.querySelectorAll(".topbar-item");

let current = 0;

setInterval(() => {
  const currentEl = topbarItems[current];

  // siguiente índice
  const next = (current + 1) % topbarItems.length;
  const nextEl = topbarItems[next];

  // animación salida
  currentEl.classList.remove("active");
  currentEl.classList.add("exit");

  // preparar entrada
  nextEl.classList.remove("exit");
  nextEl.classList.add("active");

  // limpiar clases después de animar
  setTimeout(() => {
    currentEl.classList.remove("exit");
  }, 500);

  current = next;
}, 5000);

const API_URL =
  "https://matesparana-backend-production.up.railway.app/products?sort=createdAt_desc";

/* ===================== FETCH ===================== */
async function getProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    products = mapBackendProducts(data);



    filteredProducts = [...products];

    buildCategoriesMenu(products);
    buildDynamicFilters(products);

    if (categoryFromURL) {
      applyFilters();
      closeSidebarMobile();

      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
      }
    } else {
      renderProducts(products);
    }
  } catch (error) {
  }
}

getProducts();
/* ===================== MAPPER ===================== */
function mapBackendProducts(data) {
  return data.products
    .filter((p) => p.active)
    .map((p) => {
      // La categoría viene del backend como:
      // [{ name: "Yerbas" }]
      const backendCategory = Array.isArray(p.category)
        ? p.category[0]?.name
        : null;

      return {
        id: p.id,
        name: p.name,

        // Si el backend tiene categoría, usamos esa.
        // Si no, usamos inferCategory como respaldo.
        category: backendCategory || inferCategory(p),

        price: p.discountedPrice ?? p.price,

        oldPrice: p.discountedPrice ? p.price : null,

        image: (p.image?.[0] || "https://via.placeholder.com/400").replace(
          /\s/g,
          ""
        ),

        colors: extractColors(p),

        raw: p,
      };
    });
}

function inferCategory(p) {
  const name = (p.name || "").toLowerCase();
  const type = (p.type || "").toLowerCase();

  if (
    name.includes("matera") ||
    name.includes("mochila") ||
    name.includes("canasta matera") ||
    name.includes("almohada matera")
  ) {
    return "Materas y mochilas";
  }

  if (name.includes("matepa") || name.includes("tapamate")) {
    return "Accesorios";
  }

  if (
    ["imperial", "camionero", "torpedo"].includes(type) ||
    name.includes("mate")
  ) {
    return "Mates";
  }

  if (name.includes("bombilla")) {
    return "Bombillas";
  }

  if (name.includes("termo")) {
    return "Termos";
  }

  return "Accesorios";
}
function extractColors(product) {
  if (!product.varities || !product.varities.length) return [];
  return product.varities.map((v) => v.color?.toLowerCase()).filter(Boolean);
}

/* ===================== RENDER ===================== */
function renderProducts(list, append = false) {
  if (!append) {
    productsGrid.innerHTML = "";
    lastRenderedCount = 0;
  }

  const slice = list.slice(lastRenderedCount, visibleCount);

  slice.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card fade-in";

    card.innerHTML = `
      <a href="./producto-card.html?id=${p.id}" class="product-link">
        ${p.oldPrice
        ? `<div class="badge">
         <span class="badge-value">${Math.round(
          ((p.oldPrice - p.price) / p.oldPrice) * 100
        )}%</span>
         <span class="badge-text">OFF</span>
       </div>`
        : ""
      }

        <img src="${p.image}" alt="${p.name}" loading="lazy">

        <div class="product-name">${p.name}</div>

        ${p.oldPrice
        ? `<div class="old-price">$${p.oldPrice.toLocaleString(
          "es-AR"
        )}</div>`
        : ""
      }

        <div class="product-price">$${p.price.toLocaleString("es-AR")}</div>
      </a>
    `;

    productsGrid.appendChild(card);

    requestAnimationFrame(() => {
      card.classList.add("show");
    });
  });

  lastRenderedCount = visibleCount;
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    if (visibleCount < filteredProducts.length) {
      visibleCount += 8;
      renderProducts(filteredProducts, true);
    }
  }
});
/* ===================== CATEGORÍAS + SUBMENÚ ===================== */
function buildCategoriesMenu(products) {
  const categories = {
    Mates: [],
    Bombillas: [],
    Termos: [],
    Accesorios: [],
    Yerbas: [],
    "Materas y mochilas": [],
  };

  products.forEach((p) => {
    if (categories[p.category]) categories[p.category].push(p.name);
  });

  categoryList.innerHTML = `<li data-category="all" class="active">Todos</li>`;

  Object.entries(categories).forEach(([category, productNames]) => {
    if (!productNames.length) return;

    const uniqueNames = [...new Set(productNames)];

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="category-title">${category.toUpperCase()}</div>
      <ul class="variants hidden">
        ${uniqueNames
        .map(
          (name) =>
            `<li class="variant-item" data-name="${name}">${name}</li>`
        )
        .join("")}
      </ul>
    `;

    li.querySelector(".category-title").addEventListener("click", () => {
      const ul = li.querySelector(".variants");
      const isOpen = !ul.classList.contains("hidden");

      document
        .querySelectorAll(".variants")
        .forEach((v) => v.classList.add("hidden"));

      if (!isOpen) ul.classList.remove("hidden");

      document
        .querySelectorAll(".categories li")
        .forEach((i) => i.classList.remove("active"));

      li.classList.add("active");
      currentCategory = category;
      currentProductName = null;
      applyFilters();
      closeSidebarMobile();
      // 👇 agregar esto
      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
      }
    });

    li.querySelectorAll(".variant-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        currentProductName = item.dataset.name;
        applyFilters();
        closeSidebarMobile();
        // 👇 agregar esto
        if (window.innerWidth <= 900) {
          sidebar.classList.remove("open");
        }
      });
    });

    categoryList.appendChild(li);
  });

  document
    .querySelector('[data-category="all"]')
    .addEventListener("click", () => {
      currentCategory = "all";
      currentProductName = null;
      document
        .querySelectorAll(".variants")
        .forEach((v) => v.classList.add("hidden"));
      applyFilters();
      closeSidebarMobile();
      // 👇 agregar esto
      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
      }
    });
}

/* ===================== FILTROS ===================== */
function buildDynamicFilters(products) {
  const colorCount = {};

  products.forEach((p) => {
    p.colors.forEach((c) => {
      colorCount[c] = (colorCount[c] || 0) + 1;
    });
  });

  dynamicFilters.innerHTML = `
<div class="filter-group">

<h4 class="filter-title">
  Color
  <span class="filter-arrow">⌄</span>
</h4>

<div class="filter-content">

${Object.entries(colorCount)
      .map(
        ([color, count]) => `
      <label class="color-filter">
        <input
          type="checkbox"
          data-type="color"
          value="${color}"
        >

        <span
          class="color-dot"
          style="background:${getColorHex(color)}"
        ></span>

        <span class="color-name">
          ${capitalize(color)} (${count})
        </span>
      </label>
    `
      )
      .join("")}

</div>
</div>
`;

  const title = dynamicFilters.querySelector(".filter-title");
  const content = dynamicFilters.querySelector(".filter-content");

  title.addEventListener("click", () => {
    content.classList.toggle("open");
  });

  dynamicFilters.addEventListener("change", applyFilters);
}

/* ===================== FILTRADO ===================== */
function applyFilters() {
  let filtered = [...products];

  if (currentCategory !== "all") {
    filtered = filtered.filter((p) => p.category === currentCategory);
  }

  if (currentProductName) {
    filtered = filtered.filter((p) => p.name === currentProductName);
  }

  const checkedColors = [
    ...document.querySelectorAll('input[data-type="color"]:checked'),
  ].map((i) => i.value);

  if (checkedColors.length) {
    filtered = filtered.filter((p) =>
      p.colors.some((c) => checkedColors.includes(c))
    );
  }

  filteredProducts = filtered; // 👈 guardamos el estado actual
  visibleCount = 12;
  renderProducts(filteredProducts, false);
}

/* ===================== ORDEN ===================== */
orderSelect.addEventListener("change", () => {
  let sorted = [...products];

  switch (orderSelect.value) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "az":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderProducts(sorted);
});

/* ===================== MOBILE ===================== */
filtersBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
});

function closeSidebarMobile() {
  if (window.innerWidth <= 900) {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
  }
}

/* ===================== UTILS ===================== */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getColorHex(color) {
  const colors = {
    rojo: "#d83b3b",
    negro: "#111111",
    marrón: "#6b4423",
    marron: "#6b4423",
    azul: "#2d6cdf",
    verde: "#2f9b53",
    blanco: "#ffffff",
    celeste: "#8dd6ff",
    rosa: "#f5a9c8",
    "marrón claro": "#9b6b3d",
    "marron claro": "#9b6b3d",
    "marrón oscuro": "#4d2c1d",
    "marron oscuro": "#4d2c1d",
    "gris perlado": "#bdbdbd",
  };

  return colors[color] || "#888";
}

const minusBtn = document.getElementById("minusQty");
const plusBtn = document.getElementById("plusQty");
const qtyInput = document.getElementById("qtyInput");
const addToCartBtn = document.getElementById("addToCartBtn");

minusBtn.addEventListener("click", () => {
  let val = parseInt(qtyInput.value) || 1;
  if (val > 1) qtyInput.value = val - 1;
});

plusBtn.addEventListener("click", () => {
  let val = parseInt(qtyInput.value) || 1;
  qtyInput.value = val + 1;
});

addToCartBtn.addEventListener("click", () => {
  // validación mínima de variedades
  if (!selectedColor || !selectedType) {
    alert("Por favor, elegí color y tipo antes de agregar al carrito.");
    return;
  }

  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image[0],
    varity: { color: selectedColor, type: selectedType },
    qty: parseInt(qtyInput.value) || 1,
  });
});
