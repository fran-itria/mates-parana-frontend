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

const FEATURED_URL =
  "https://matesparana-backend-production.up.railway.app/products/section/Destacado";

const featuredSlider = document.getElementById("featuredSlider");
const featuredPrev = document.getElementById("featuredPrev");
const featuredNext = document.getElementById("featuredNext");

async function loadFeatured() {
  try {
    const res = await fetch(FEATURED_URL);
    const products = await res.json();

    featuredSlider.innerHTML = "";

    products.forEach((product) => {
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
        ${
          discountPercentage && discountedPrice
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
            ${
              Number(discountedPrice) > 0
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
        ${
          cardPrice
            ? `
            <p class="featured-old">o 3 cuotas sin interés de ${formatPrice(
              cardPrice / 3
            )} c/u</p>
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
        window.location.href = `./producto-card.html?id=${product.id}`;
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
  } catch (err) {}
}

loadFeatured();
/*==================LO MAS PEDIDO======================== */

const PROMOS_URL =
  "https://matesparana-backend-production.up.railway.app/promotions";

const COMBOS_CATEGORY_ID = "d5308357-2ae0-4c7a-a83f-7cf7fc599a34";

const SALE_URL =
  "https://matesparana-backend-production.up.railway.app/promotions";
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
  const promos = data.promotions || [];

  slider.innerHTML = "";

  promos
    .filter((p) => p.active)
    .forEach((promo) => {
      const cardPrice = promo.cardPrice;
      const price = promo.price;
      const discountedPrice = promo.discountedPrice;

      let discountPercentage = null;
      if (discountedPrice)
        discountPercentage = (product.discountedPrice * 100) / product.price;

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
        ${
          discountPercentage && discountedPrice
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
            ${
              Number(discountedPrice) > 0
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
        ${
          cardPrice
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
  "https://matesparana-backend-production.up.railway.app/products?sort=updatedAt_desc&visibility=visible&category=Yerbas";

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
    const products = data.products;

    discountSlider.innerHTML = "";

    products.forEach((product) => {
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
        window.location.href = `./producto-card.html?id=${product.id}`;
      });

      discountSlider.appendChild(card);
    });
  } catch (err) {}
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

/*========================================== */
