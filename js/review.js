document.addEventListener("DOMContentLoaded", () => {
  const reviews = [
    {
      text: "Mi pedido llegó rapidísimo y lo amé. Gracias!!",
      name: "ANDREA LOPEZ",
    },
    {
      text: "Tuve una consulta sobre los termos y me respondieron súper rápido. La atención es excelente y me ayudaron a elegir lo que necesitaba.",
      name: "AGUSTIN MARTINEZ",
    },
    {
      text: "Compré un mate de algarrobo y una bombilla, la calidad, la atención y el precio es todo! Lo super recomiendo",
      name: "SOL ALVAREZ",
    },
    {
      text: "Hermoso todo, se nota la calidad en los detalles.",
      name: "LUCAS FERNANDEZ",
    },
    {
      text: "La matera es un lujo, llegó perfecta.",
      name: "CARLA GOMEZ",
    },
    {
      text: "excelente atencion, super recomendado",
      name: "ALEXIS",
    },
    {
      text: "Llego todo de 10",
      name: "IVAN ARREDONDO",
    },
    {
      text: "Me encanta la calidad de los productos, y la atencion es muy buena",
      name: "MICAELA SEGOVIA",
    },
    {
      text: "La atencion y el asesoramiento son cosas que tengo que destacar, muy bueno todo",
      name: "RITA MANRIQUE",
    },
    {
      text: "Muy top todo, muy recomendando",
      name: "LUCIA TORRES",
    },
    {
      text: "La atención es un 10, son muy crack",
      name: "TOMAS BARRIOS",
    },
    {
      text: "Me llego todo perfecto, gracias !",
      name: "R0MINA MURADOR",
    },
  ];

  const track = document.getElementById("reviewsTrack");

  let index = 0;
  let cards = [];

  /* ===================== UTILS ===================== */
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  /* ===================== RENDER ===================== */
  function renderReviews() {
    const shuffled = shuffle([...reviews]);

    track.innerHTML = shuffled
      .map(
        (review) => `
      <div class="review-card">
        <div class="review-inner">
          <div class="review-avatar">👤</div>
          <p class="review-text">${review.text}</p>
          <span class="review-name">${review.name}</span>
        </div>
      </div>
    `
      )
      .join("");
  }

  /* ===================== SLIDER ===================== */
  function initReviewsSlider() {
    cards = Array.from(track.children);
    updateReviewsSlider();
  }

  function updateReviewsSlider() {
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }

  function nextReview() {
    if (index < cards.length - 3) {
      index++;
    } else {
      index = 0;
    }
    updateReviewsSlider();
  }

  /* ===================== INIT ===================== */
  renderReviews();
  initReviewsSlider();

  setInterval(nextReview, 4000);
  window.addEventListener("resize", updateReviewsSlider);
});
