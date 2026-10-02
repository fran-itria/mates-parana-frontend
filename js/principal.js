const track = document.querySelector(".slider-track");
const slides = document.querySelectorAll(".slider-track img");

if (track && slides.length > 0) {
  let index = 0;

  setInterval(() => {
    index++;
    if (index >= slides.length) {
      index = 0;
    }
    track.style.transform = `translateX(-${index * 100}%)`;
  }, 4000);
} // cambia cada 4 segundos

/*=====================SEGUINOS EN INSTAGRAM============================ */
const instagramSection = document.querySelector(".instagram-section");

if (instagramSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          instagramSection.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  observer.observe(instagramSection);
}

/*==================MI CUENTA========================= */

const miCuentaBtn = document.getElementById("miCuentaBtn");

if (miCuentaBtn) {
  miCuentaBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = "mi-cuenta.html";
    } else {
      window.location.href = "login.html";
    }
  });
}

/*===========DESTACADOS=====================*/

/* ===== DESTACADOS ===== */

// Base de la API: cambiar a producción antes de subir
const HOME_API_BASE = "https://matesparana-backend-production.up.railway.app";

const FEATURED_URL =
  `${HOME_API_BASE}/products/find/category/Nos_volvimos_locos`;

const featuredSlider = document.getElementById("featuredSlider");
const featuredPrev = document.getElementById("featuredPrev");
const featuredNext = document.getElementById("featuredNext");

async function loadFeatured() {
  try {
    const res = await fetch(FEATURED_URL);
    const products = await res.json();

    featuredSlider.innerHTML = "";

    // El backend ya los devuelve ordenados por sortedAt
    const featuredList = products.filter((p) => p.active);
    window.MPTrack?.viewItemList(
      "nos_volvimos_locos",
      "Nos volvimos locos",
      featuredList
    );

    featuredList.forEach((product, featuredIndex) => {
      const cardPrice = product.cardPrice;
      const price = product.price;
      const discountedPrice = product.discountedPrice;
      let discountPercentage = null;
      if (discountedPrice)
        discountPercentage = Math.round(
          100 - (product.discountedPrice * 100) / product.price
        );
      const card = document.createElement("div");
      card.className = "featured-card";

      const image =
        product.images?.[0] ||
        product.image?.[0] ||
        product.image ||
        "/img/placeholder.png";

      card.innerHTML = `
  <img src="${image}" alt="${product.name}">

  <h3 class="featured-name">${product.name}</h3>

  <div class="prices-transfer-section">

    <div class="featured-price-row">

      ${Number(discountedPrice) > 0
          ? `
            <span class="featured-price">
              ${formatPrice(discountedPrice)}
            </span>
          `
          : `
            <span class="featured-price">
              ${formatPrice(price)}
            </span>
          `
        }

      ${discountPercentage && discountedPrice
          ? `
            <span class="featured-badge">
              <span class="featured-value">${discountPercentage}%</span>
              <span class="featured-text">OFF</span>
            </span>
          `
          : ""
        }

    </div>

    ${Number(discountedPrice) > 0
          ? `
          <span class="featured-price-through">
            ${formatPrice(price)}
          </span>
        `
          : ""
        }

  </div>

  ${cardPrice
          ? `
        <p class="featured-old">
          o 3 cuotas sin interés de ${formatPrice(cardPrice / 3)} c/u
        </p>
      `
          : ""
        }
`;

      featuredSlider.appendChild(card);

      const priceElement = card.querySelector(".featured-price-transfer");
      if (priceElement && discountedPrice) {
        priceElement.classList.replace(
          "featured-price",
          "featured-price-through"
        );
      }
      card.addEventListener("click", () => {
        window.MPTrack?.selectItem(
          "nos_volvimos_locos",
          "Nos volvimos locos",
          product,
          featuredIndex,
          { isCombo: Boolean(product.defaultSelected) }
        );
        if (!product.defaultSelected)
          window.location.href = `./producto-card.html?id=${product.id}`;
        else
          window.location.href = `./producto-card.html?id=${product.id}&type=combo`;
      });
    });

    // Configurar botones cuando las tarjetas ya existen
    const firstCard = featuredSlider.querySelector(".featured-card");

    if (firstCard) {
      const distance = firstCard.offsetWidth + 18;

      featuredNext.addEventListener("click", () => {
        featuredSlider.scrollBy({
          left: distance,
          behavior: "smooth",
        });
      });

      featuredPrev.addEventListener("click", () => {
        featuredSlider.scrollBy({
          left: -distance,
          behavior: "smooth",
        });
      });
    }
  } catch (err) { }
}

loadFeatured();
/*==================LO MAS PEDIDO======================== */

const PROMOS_URL =
  `${HOME_API_BASE}/promotions`;

const COMBOS_CATEGORY_ID = "d5308357-2ae0-4c7a-a83f-7cf7fc599a34";

const SALE_URL = `${HOME_API_BASE}/products/find/category/Lo_más_pedido`;
const slider = document.getElementById("saleSlider");
const prevBtn = document.getElementById("salePrev");
const nextBtn = document.getElementById("saleNext");

function formatPrice(price) {
  return price.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function calcDiscount(oldPrice, newPrice) {
  if (!oldPrice || !newPrice || oldPrice <= newPrice) return null;
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return `-${discount}%`;
}

async function loadSales() {
  if (!slider) return; // 👈 CLAVE
  const res = await fetch(SALE_URL);

  const data = await res.json();
  const promos = data || [];

  slider.innerHTML = "";

  const saleList = promos.filter((p) => p.active);
  window.MPTrack?.viewItemList("lo_mas_pedido", "Lo más pedido", saleList, {
    isCombo: true,
  });

  saleList.forEach((promo, saleIndex) => {
    const cardPrice = promo.cardPrice;
    const price = promo.price;
    const discountedPrice = promo.discountedPrice;

    let discountPercentage = null;
    if (discountedPrice)
      discountPercentage = Math.round(
        (promo.discountedPrice * 100) / promo.price
      );

    const image =
      promo.images?.[0] ||
      promo.image?.[0] ||
      promo.image ||
      "/img/placeholder.png";

    const card = document.createElement("div");
    card.className = "featured-card";

    card.innerHTML = `
        <img src="${image}" alt="${promo.name}">
        <h3 class="featured-name">${promo.name}</h3>
        ${discountPercentage && discountedPrice
        ? `
          <span class="featured-badge">
            <span class="featured-value">${discountPercentage}%</span>
            <span class="featured-text">OFF</span>
          </span>
          `
        : ""
      }
        <div class="prices-transfer-section">
          <div class="prices-transfer-container">
            ${Number(discountedPrice) > 0
        ? `
              <span class="featured-price">${formatPrice(
          discountedPrice
        )}</span>
              `
        : ""
      }
            <span class="featured-price featured-price-transfer">${formatPrice(
        price
      )}</span>
          </div>
        </div>
        ${cardPrice
        ? `
            <p class="featured-old">o 3 cuotas sin interés de ${formatPrice(
          cardPrice / 3
        )} c/u</p>
          `
        : ""
      }
      `;

    slider.appendChild(card);

    const priceElement = card.querySelector(".featured-price-transfer");
    if (priceElement && discountedPrice) {
      priceElement.classList.replace(
        "featured-price",
        "featured-price-through"
      );
    }

    card.addEventListener("click", () => {
      window.MPTrack?.selectItem(
        "lo_mas_pedido",
        "Lo más pedido",
        promo,
        saleIndex,
        { isCombo: true }
      );
      window.location.href = `./producto-card.html?id=${promo.id}&type=combo`;
    });
  });

  // 🔥 activar drag después de renderizar
  const card = slider.querySelector(".featured-card");

  if (card) {
    const distance = card.offsetWidth + 18;

    nextBtn.onclick = () => {
      slider.scrollBy({
        left: distance,
        behavior: "smooth",
      });
    };

    prevBtn.onclick = () => {
      slider.scrollBy({
        left: -distance,
        behavior: "smooth",
      });
    };
  }
}

loadSales();
/* ===== SLIDER BANNERS ===== */

const bannerTrack = document.querySelector(".slider-track");
const bannerSlides = document.querySelectorAll(".slider-track picture");
const bannerPrevBtn = document.querySelector(".slider-btn.prev");
const bannerNextBtn = document.querySelector(".slider-btn.next");
const dotsContainer = document.querySelector(".slider-dots");

if (bannerTrack && bannerSlides.length > 0) {
  let bannerIndex = 0;
  let autoPlay;

  // ==============================
  // DETECTAR MOBILE
  // ==============================

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // ==============================
  // CREAR DOTS
  // ==============================

  bannerSlides.forEach((_, i) => {
    const dot = document.createElement("span");

    if (i === 0) {
      dot.classList.add("active");
    }

    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoplay();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".slider-dots span");

  // ==============================
  // ACTUALIZAR DOTS
  // ==============================

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === bannerIndex);
    });

    trackBannerView(bannerIndex);
  }

  // Tracking: view_promotion una sola vez por banner
  const viewedBanners = new Set();

  function trackBannerView(i) {
    if (viewedBanners.has(i)) return;
    viewedBanners.add(i);

    const img = bannerSlides[i]?.querySelector("img");
    const creative = (img?.getAttribute("src") || "").split("/").pop();

    window.MPTrack?.viewPromotion({
      promotion_id: `banner_home_${i + 1}`,
      promotion_name: img?.getAttribute("alt") || `Banner ${i + 1}`,
      creative_name: creative,
      creative_slot: `home_slider_${i + 1}`,
    });
  }

  // ==============================
  // IR A SLIDE
  // ==============================

  function goToSlide(index, animate = true) {
    bannerIndex = index;

    // ==========================
    // MOBILE
    // ==========================

    if (isMobile()) {
      const slideWidth = bannerTrack.clientWidth;

      bannerTrack.scrollTo({
        left: slideWidth * bannerIndex,
        behavior: animate ? "smooth" : "auto",
      });

      updateDots();

      return;
    }

    // ==========================
    // DESKTOP
    // ==========================

    if (!animate) {
      bannerTrack.style.transition = "none";
    } else {
      bannerTrack.style.transition = "";
    }

    bannerTrack.style.transform = `translateX(-${bannerIndex * 100}%)`;

    updateDots();

    if (!animate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bannerTrack.style.transition = "";
        });
      });
    }
  }

  // ==============================
  // SIGUIENTE
  // ==============================

  function nextSlide() {
    bannerIndex++;

    if (bannerIndex >= bannerSlides.length) {
      bannerIndex = 0;
    }

    goToSlide(bannerIndex);
  }

  // ==============================
  // ANTERIOR
  // ==============================

  function prevSlide() {
    bannerIndex--;

    if (bannerIndex < 0) {
      bannerIndex = bannerSlides.length - 1;
    }

    goToSlide(bannerIndex);
  }

  // ==============================
  // AUTOPLAY
  // ==============================

  function startAutoplay() {
    clearInterval(autoPlay);

    autoPlay = setInterval(() => {
      nextSlide();
    }, 4000);
  }

  function resetAutoplay() {
    clearInterval(autoPlay);

    startAutoplay();
  }

  // ==============================
  // BOTÓN SIGUIENTE
  // ==============================

  if (bannerNextBtn) {
    bannerNextBtn.addEventListener("click", () => {
      nextSlide();
      resetAutoplay();
    });
  }

  // ==============================
  // BOTÓN ANTERIOR
  // ==============================

  if (bannerPrevBtn) {
    bannerPrevBtn.addEventListener("click", () => {
      prevSlide();
      resetAutoplay();
    });
  }

  // ==============================
  // ACTUALIZAR DOTS AL HACER SWIPE
  // ==============================

  if (isMobile()) {
    bannerTrack.addEventListener(
      "scroll",
      () => {
        const slideWidth = bannerTrack.clientWidth;

        if (slideWidth <= 0) return;

        const newIndex = Math.round(bannerTrack.scrollLeft / slideWidth);

        if (newIndex !== bannerIndex) {
          bannerIndex = newIndex;

          updateDots();

          resetAutoplay();
        }
      },
      { passive: true }
    );
  }

  // ==============================
  // RESIZE
  // ==============================

  window.addEventListener("resize", () => {
    goToSlide(bannerIndex, false);
  });

  // ==============================
  // INICIAR
  // ==============================

  goToSlide(0, false);

  startAutoplay();
}

/*========================================== */

/*======NAV INFERIOR===================== */

document.querySelectorAll(".acordeon-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".acordeon");
    item.classList.toggle("activo");
  });
});

/* ===== DESCUENTOS ===== */
const DISCOUNT_URL =
  `${HOME_API_BASE}/products/find/category/Yerbas`;

const discountSlider = document.getElementById("discountSlider");
const discountPrev = document.getElementById("discountPrev");
const discountNext = document.getElementById("discountNext");

async function loadDiscounts() {
  try {
    const res = await fetch(DISCOUNT_URL);

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();

    // Los productos vienen dentro de "products"
    const products = data;

    discountSlider.innerHTML = "";

    window.MPTrack?.viewItemList("home_yerbas", "Yerbas", products);

    products.filter(p => p.active).forEach((product, discountIndex) => {
      const card = document.createElement("div");
      card.className = "discount-card";

      card.innerHTML = `
        <img
          src="${product.image?.[0] || ""}"
          alt="${product.name}"
        >

        <h3 class="discount-name">
          ${product.name}
        </h3>

        <span class="discount-price">
          ${formatPrice(product.price)}
        </span>

        <button class="discount-add">
          Agregar al carrito
        </button>
      `;

      card.addEventListener("click", () => {
        window.MPTrack?.selectItem(
          "home_yerbas",
          "Yerbas",
          product,
          discountIndex
        );
        window.location.href = `./producto-card.html?id=${product.id}`;
      });

      discountSlider.appendChild(card);
    });
  } catch (err) { }
}

loadDiscounts();

function scrollDiscount(direction) {
  const card = discountSlider.querySelector(".discount-card");

  if (!card) return;

  const gap = 18;
  const distance = card.offsetWidth + gap;

  discountSlider.scrollBy({
    left: direction * distance,
    behavior: "smooth",
  });
}

discountNext.addEventListener("click", () => {
  scrollDiscount(1);
});

discountPrev.addEventListener("click", () => {
  scrollDiscount(-1);
});

/*===================ACCESORIOS======================= */
/* ===== ACCESORIOS ===== */

const ACCESSORIES_URL =
  `${HOME_API_BASE}/products?sort=updatedAt_desc&visibility=visible&category=Accesorios`;

const accessoriesSlider = document.getElementById("accessoriesSlider");
const accessoriesPrev = document.getElementById("accessoriesPrev");
const accessoriesNext = document.getElementById("accessoriesNext");

async function loadAccessories() {
  try {
    const res = await fetch(ACCESSORIES_URL);

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();

    // Los productos vienen dentro de "products"
    const products = data.products;

    accessoriesSlider.innerHTML = "";

    window.MPTrack?.viewItemList("home_accesorios", "Accesorios", products);

    products.forEach((product, accessoriesIndex) => {
      const card = document.createElement("div");

      card.className = "accessories-card";

      card.innerHTML = ` <img src="${product.image?.[0] || ""}" alt="${product.name
        }" > <h3 class="accessories-name"> ${product.name
        } </h3> <span class="accessories-price"> ${formatPrice(
          product.price
        )} </span> ${Number(product.price) > 0
          ? ` <p class="accessories-installments"> o 3 cuotas sin interés de ${formatPrice(
            Number(product.price) / 3
          )} c/u </p> `
          : ""
        } `;

      card.addEventListener("click", () => {
        window.MPTrack?.selectItem(
          "home_accesorios",
          "Accesorios",
          product,
          accessoriesIndex
        );
        window.location.href = `./producto-card.html?id=${product.id}`;
      });

      accessoriesSlider.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargando accesorios:", err);
  }
}

loadAccessories();

/* ===== SCROLL ===== */

function scrollAccessories(direction) {
  const card = accessoriesSlider.querySelector(".accessories-card");

  if (!card) return;

  const gap = 18;

  const distance = card.offsetWidth + gap;

  accessoriesSlider.scrollBy({
    left: direction * distance,
    behavior: "smooth",
  });
}

/* ===== BOTONES ===== */

accessoriesNext.addEventListener("click", () => {
  scrollAccessories(1);
});

accessoriesPrev.addEventListener("click", () => {
  scrollAccessories(-1);
});
