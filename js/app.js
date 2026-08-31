/*MENU HAMBURGUESA */

const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

/*============MENU MOBILE===================== */

/*========================================== */

function normalizeFontName(name) {
  return name.replace(/\s+/g, "_");
}

// 🔥 Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAn0uwpaQQSNOMARBfC3LXRUgu6ffMzHPo",
  authDomain: "mates-parana.firebaseapp.com",
  projectId: "mates-parana",
  storageBucket: "mates-parana.firebasestorage.app",
  messagingSenderId: "156330486703",
  appId: "1:156330486703:web:c0153bab57c08555e65d5a",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a Storage
const storage = firebase.storage();

/*========================== */

const btnAddImage = document.getElementById("btnAddImage");
const fileInput = document.getElementById("fileInput");

const gizmoLayer = document.getElementById("gizmoLayer");
const svg = document.getElementById("designArea");
const group = document.getElementById("designGroup");
const assetsPanel = document.getElementById("assetsPanel");
const tabs = document.querySelectorAll(".tab");

const floatingControls = document.getElementById("floatingControls");
const btnScaleUp = document.getElementById("btnScaleUp");
const btnScaleDown = document.getElementById("btnScaleDown");

const btnDelete = document.getElementById("btnDelete");

const btnAddText = document.getElementById("btnAddText");
const textInput = document.getElementById("textInputFloating");

const btnCurveMore = document.getElementById("btnCurveMore");
const btnCurveLess = document.getElementById("btnCurveLess");
const btnInvertCurve = document.getElementById("btnInvertCurve");

const GIZMO_HANDLE_RADIUS = 1.5;

svg.addEventListener("pointerdown", (e) => {
  // 🔥 si tocó un gizmo NO deseleccionar
  if (
    e.target.closest(".rotate-gizmo") ||
    e.target.closest(".scale-gizmo") ||
    e.target.closest(".move-gizmo")
  ) {
    return;
  }

  if (e.target === svg) {
    deselect();
  }
});

const isTouch =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia("(pointer: coarse)").matches;

let selected = null;
let activeScale = null;
let activeRotate = null;
let activeMove = null;
let startPoint = null;
let cachedBBox = null;
let cachedCenter = null;

/* =========================
   DATA
========================= */

const FONTS = [
  "ARIAL",
  "bradleyHand",
  "Cambria",
  "ComicSanSms",
  "Copperplate",
  "gabriola",
  "Lucida",
  "microsofthimalaya",
  "segoeprint",
  "timesnewroman",
];

const FONT_FILES = {
  ARIAL: "./fonts/ARIAL.ttf",
  bradleyHandItcRegular: "./fonts/bradleyHandItcRegular.ttf",
  CambriaRegular: "./fonts/CambriaRegular.ttf",
  ComicSanSms: "./fonts/ComicSanSms.ttf",
  copperplategothiclight: "./fonts/copperplategothiclight.ttf",
  gabriola: "./fonts/gabriola.ttf",
  LucidaUnicodeCalligraphy: "./fonts/LucidaUnicodeCalligraphy.ttf",
  microsofthimalaya: "./fonts/microsofthimalaya.ttf",
  segoeprint: "./fonts/segoeprint.ttf",
  timesnewroman: "./fonts/timesnewroman.ttf",
};

const loadedFonts = {};

async function loadFont(fontName) {
  if (loadedFonts[fontName]) return loadedFonts[fontName];

  const url = FONT_FILES[fontName];

  if (!url) {
    console.warn("No hay archivo para fuente:", fontName);
    return null;
  }

  return new Promise((resolve, reject) => {
    opentype.load(url, (err, font) => {
      if (err) {
        console.error("Error cargando fuente:", fontName);
        reject(err);
      } else {
        loadedFonts[fontName] = font;
        resolve(font);
      }
    });
  });
}

async function textToPath(g) {
  const text = g.getAttribute("data-text");
  const fontName = g.getAttribute("data-font");

  const fontSize = 60;

  const font = await loadFont(fontName);

  if (!font) {
    console.warn("Fuente no encontrada:", fontName);
    return;
  }

  // =========================
  // GENERAR PATH
  // =========================

  const path = font.getPath(text, 0, 0, fontSize);

  const pathData = path.toPathData(2);

  // limpiar contenido anterior
  while (g.firstChild) {
    g.removeChild(g.firstChild);
  }

  // crear path final
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");

  pathEl.setAttribute("d", pathData);

  pathEl.setAttribute("fill", "black");

  // IMPORTANTE:
  // NO aplicar transform manual
  // el <g> ya maneja posición/rotación/escala

  g.appendChild(pathEl);
}

const API = {
  "Laureles y lineas": [
    "emoji1.svg",
    "emoji2.svg",
    "emoji3.svg",
    "emoji4.svg",
    "emoji5.svg",
    "emoji6.svg",
    "emoji7.svg",
    "emoji8.svg",
    "emoji9.svg",
    "emoji10.svg",
    "emoji11.svg",
    "emoji12.svg",
    "emoji13.svg",
    "emoji14.svg",
    "emoji15.svg",
    "emoji16.svg",
    "emoji17.svg",
    "emoji18.svg",
    "emoji19.svg",
    "emoji20.svg",
    "emoji21.svg",
    "emoji22.svg",
    "emoji23.svg",

    "emoji17.svg",
  ],
  Futbol: [
    "escudo1.svg",
    "escudo2.svg",
    "escudo3.svg",
    "escudo4.svg",
    "escudo5.svg",
    "escudo7.svg",
    "escudo8.svg",
    "escudo9.svg",
    "escudo10.svg",
    "escudo11.svg",
    "escudo12.svg",
    "escudo13.svg",
    "escudo14.svg",
    "escudo15.svg",
    "escudo16.svg",
    "escudo17.svg",
    "escudo18.svg",
    "escudo19.svg",
    "escudo20.svg",
    "escudo21.svg",
    "escudo22.svg",
    "escudo23.svg",
    "escudo24.svg",
    "escudo25.svg",
    "escudo26.svg",
    "escudo27.svg",
    "escudo28.svg",
    "escudo29.svg",
    "escudo30.svg",
    "escudo31.svg",
    "escudo32.svg",
    "escudo33.svg",
    "escudo34.svg",
    "escudo35.svg",
    "escudo36.svg",
    "escudo37.svg",
    "escudo38.svg",
    "escudo39.svg",
    "escudo40.svg",
    "escudo41.svg",
  ],
  Musica: [
    "banda1.svg",
    "banda2.svg",
    "banda3.svg",
    "banda4.svg",
    "banda5.svg",
    "banda6.svg",
    "banda7.svg",
    "banda8.svg",
    "banda9.svg",
    "banda10.svg",
    "banda11.svg",
    "banda12.svg",
    "banda13.svg",
    "banda14.svg",
    "banda15.svg",
    "banda16.svg",
    "banda17.svg",
    "banda18.svg",
    "banda19.svg",
    "banda20.svg",
    "banda21.svg",
    "banda22.svg",
    "banda23.svg",
    "banda24.svg",
    "banda25.svg",
    "banda26.svg",
    "banda27.svg",
    "banda28.svg",
    "banda29.svg",
    "banda30.svg",
    "banda31.svg",
    "banda32.svg",
    "banda33.svg",
  ],
  Argentina: [
    "otros3.svg",
    "otros6.svg",
    "otros7.svg",
    "otros8.svg",
    "otros9.svg",
    "otros10.svg",
    "otros11.svg",
    "otros12.svg",
  ],
  diseños: [
    "diseños1.svg",
    "diseños2.svg",
    "diseños3.svg",
    "diseños4.svg",
    "diseños5.svg",
    "diseños6.svg",
    "diseños7.svg",
    "diseños8.svg",
    "diseños9.svg",
    "diseños10.svg",
    "diseños11.svg",
    "diseños12.svg",
    "diseños13.svg",
    "diseños14.svg",
    "diseños15.svg",
    "diseños16.svg",
    "diseños17.svg",
    "diseños18.svg",
    "diseños19.svg",
  ],
  "Corazones y mas": [
    "otros1.svg",
    "otros2.svg",
    "otros3.svg",
    "otros4.svg",
    "otros5.svg",
    "otros6.svg",
    "otros7.svg",
    "otros8.svg",
    "otros9.svg",
    "otros10.svg",
    "otros11.svg",
  ],
};

const CATEGORY_TARGET_SIZES = {
  "Laureles y lineas": 30,
  escudos: 50,
  bandas: 50,
  diseños: 93, // 👈 esta categoría aparece más grande
  emojis: 50,
};

window.addEventListener("pointermove", (e) => {
  /* ===== ESCALAR ===== */
  if (activeScale) {
    const { el, center, startDist, startScale } = activeScale;

    const p = getMousePosition(e);
    const dist = Math.hypot(p.x - center.x, p.y - center.y);

    let factor = dist / startDist;
    factor = Math.max(0.2, Math.min(factor, 5));

    let newScale = startScale * factor;
    newScale = Math.max(0.05, Math.min(newScale, 10));

    el.dataset.scale = newScale;
    updateTransform(el);
  }

  /* ===== ROTAR ===== */

  if (activeRotate) {
    e.preventDefault();
    const { el, center, startAngle, startRotation } = activeRotate;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());

    const angle = Math.atan2(p.y - center.y, p.x - center.x);
    const delta = (angle - startAngle) * (180 / Math.PI);

    el.dataset.rotation = startRotation + delta;
    updateTransform(el);
  }
});

window.addEventListener("pointerup", () => {
  activeScale = null;
  activeRotate = null;
  activeMove = null;
});

/* =========================
   UTILS
========================= */

function loadFontsPanel() {
  assetsPanel.innerHTML = "";

  FONTS.forEach((font) => {
    const div = document.createElement("div");
    div.className = "font-item";
    div.textContent = "Ejemplo";
    div.style.fontFamily = font;

    div.addEventListener("click", () => {
      if (selected && selected.dataset.type === "text") {
        selected.dataset.font = font;
        buildText(selected);
      }
    });

    assetsPanel.appendChild(div);
  });
}

function getMousePosition(evt) {
  const CTM = svg.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d,
  };
}

/* =========================
   SELECCIÓN
========================= */

function deselect() {
  if (!selected) return;

  // 🔥 borrar gizmos del elemento
  selected
    .querySelectorAll(".scale-gizmo, .rotate-gizmo")
    .forEach((g) => g.remove());

  selected.classList.remove("selected");
  selected = null;

  floatingControls.classList.add("hidden");
  textInput.classList.add("hidden");

  // 🔥 por si quedó algo suelto
  gizmoLayer.innerHTML = "";
}

function stripGizmos(root) {
  root
    .querySelectorAll(".scale-gizmo, .rotate-gizmo, .move-gizmo")
    .forEach((g) => g.remove());
}

function selectElement(el) {
  if (selected && selected !== el) {
    selected.classList.remove("selected");
    removeGizmos(selected);
  }

  selected = el;
  if (!selected) return;

  selected.classList.add("selected");
  floatingControls.classList.remove("hidden");

  if (selected.dataset.type === "text") {
    textInput.classList.remove("hidden");
    textInput.value = selected.dataset.text;

    btnCurveMore.style.display = "inline-flex";
    btnCurveLess.style.display = "inline-flex";
    btnInvertCurve.style.display = "inline-flex";
  } else {
    textInput.classList.add("hidden");

    btnCurveMore.style.display = "none";
    btnCurveLess.style.display = "none";
    btnInvertCurve.style.display = "none";
  }

  if (el.dataset.type !== "text") {
    showRotateGizmo(el);
    showScaleGizmo(el);
  }

  if (isTouch) {
    showMoveGizmoUnified(el);
    updateMoveGizmoPosition(el);
  }

  console.log("Scale gizmo", document.querySelector(".scale-gizmo"));
}

/* =========================
   DRAG PC
========================= */

function makeSelectable(el) {
  el.style.pointerEvents = "all";
  el.style.touchAction = "none";

  el.addEventListener("pointerdown", (e) => {
    // 🔥 ignorar gizmos
    if (
      e.target.closest(".rotate-gizmo") ||
      e.target.closest(".scale-gizmo") ||
      e.target.closest(".move-gizmo")
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    console.log("pointerdown", e.pointerType);

    selectElement(el);

    // 🔥 iniciar drag tanto mouse como touch
    startPoint = getMousePosition(e);

    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", (e) => {
    // 🔥 ahora permite touch también
    if (!startPoint || selected !== el) return;

    // 🔥 bloquear texto circular
    if (el.dataset.lockedCircle === "true") return;

    e.preventDefault();

    const p = getMousePosition(e);

    const dx = p.x - startPoint.x;
    const dy = p.y - startPoint.y;

    el.dataset.x = (parseFloat(el.dataset.x) || 0) + dx;
    el.dataset.y = (parseFloat(el.dataset.y) || 0) + dy;

    updateTransform(el);

    // 🔥 actualizar gizmo mobile
    if (isTouch) {
      updateMoveGizmoPosition(el);
    }

    startPoint = p;
  });

  el.addEventListener("pointerup", (e) => {
    startPoint = null;

    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
  });

  el.addEventListener("pointercancel", () => {
    startPoint = null;
  });
}

/* =========================
   GIZMO ROTAR
========================= */

function showRotateGizmo(el) {
  if (!el) return;

  gizmoLayer.querySelector(".rotate-gizmo")?.remove();

  const bbox = getBBoxWithoutGizmos(el);

  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const tx = parseFloat(el.dataset.x) || 0;
  const ty = parseFloat(el.dataset.y) || 0;

  const size = Math.max(bbox.width, bbox.height);

  // ⚠️ BASE ESTABLE (como antes)
  let r = size / 9 + 6;

  const handleRadius = GIZMO_HANDLE_RADIUS;

  const handleDistance = r + 1;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.classList.add("rotate-gizmo");
  g.dataset.ui = "true";

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", cx + tx);
  circle.setAttribute("cy", cy + ty);
  circle.setAttribute("r", r);
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "dodgerblue");
  circle.setAttribute("stroke-width", "0.4");
  circle.setAttribute("stroke-dasharray", "2 2");

  const handle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  handle.setAttribute("cx", cx + tx);
  handle.setAttribute("cy", cy + ty - handleDistance);
  handle.setAttribute("r", handleRadius);
  handle.setAttribute("fill", "dodgerblue");
  handle.style.cursor = "grab";
  handle.style.pointerEvents = "all";

  g.appendChild(circle);
  g.appendChild(handle);
  gizmoLayer.appendChild(g);

  enableRotateGizmo(handle, el);
}

function enableRotateGizmo(handle, el) {
  handle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();

    const bbox = el.getBBox();

    // 🔥 centro REAL del elemento en el SVG
    const center = {
      x: bbox.x + bbox.width / 2 + (parseFloat(el.dataset.x) || 0),
      y: bbox.y + bbox.height / 2 + (parseFloat(el.dataset.y) || 0),
    };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const p = pt.matrixTransform(svg.getScreenCTM().inverse());

    activeRotate = {
      el,
      center,
      startAngle: Math.atan2(p.y - center.y, p.x - center.x),
      startRotation: parseFloat(el.dataset.rotation) || 0,
    };
  });
}

function getBBoxWithoutGizmos(el) {
  const gizmos = el.querySelectorAll(".rotate-gizmo, .scale-gizmo");
  gizmos.forEach((g) => (g.style.display = "none"));

  const bbox = el.getBBox();

  gizmos.forEach((g) => (g.style.display = ""));

  return bbox;
}

function getElementCenter(el) {
  let bbox;

  try {
    bbox = el.getBBox();
  } catch {
    bbox = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
  }
  return {
    cx: bbox.x + bbox.width / 2,
    cy: bbox.y + bbox.height / 2,
  };
}

function updateTransform(el) {
  const x = parseFloat(el.dataset.x) || 0;
  const y = parseFloat(el.dataset.y) || 0;
  const scale = parseFloat(el.dataset.scale) || 1;
  const rotation = parseFloat(el.dataset.rotation) || 0;

  // CASO TEXTO CIRCULAR
  if (el.dataset.type === "text") {
    const textAngle = parseFloat(el.dataset.textAngle) || 0;

    el.setAttribute(
      "transform",
      `
        translate(${x}, ${y})
        rotate(${rotation + textAngle} 0 0)
        scale(${scale})
      `
    );

    return;
  }

  // CASO SVG / IMÁGENES
  const { cx, cy } = getElementCenter(el);

  el.setAttribute(
    "transform",
    `
      translate(${x}, ${y})
      translate(${cx}, ${cy})
      rotate(${rotation})
      scale(${scale})
      translate(${-cx}, ${-cy})
    `
  );
}

function getTransformData(el) {
  return {
    x: parseFloat(el.dataset.x) || 0,
    y: parseFloat(el.dataset.y) || 0,
    scale: parseFloat(el.dataset.scale) || 1,
    rotation: parseFloat(el.dataset.rotation) || 0,
  };
}

function normalizeText(el) {
  if (el.dataset.type !== "text") return;

  el.querySelectorAll("text").forEach((t) => {
    t.setAttribute("x", "0");
    t.setAttribute("y", "0");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
  });
}

function removeGizmos(el) {
  if (!el) return;

  const r = el.querySelector(".rotate-gizmo");
  if (r) r.remove();

  const s = gizmoLayer.querySelector(".scale-gizmo");
  if (s) s.remove();
}

/* =========================
  CREAR IMAGEN
========================= */

async function cargarSVGInline(url) {
  const res = await fetch(url);
  const text = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");

  const svg = doc.querySelector("svg");

  makeSvgIdsUnique(svg);

  return svg;
}

async function createImageElement(src, category) {
  console.log("CLICK:", src);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  g.setAttribute("data-type", "svg");
  g.dataset.category = category;
  g.dataset.scale = 1;
  g.dataset.rotation = 0;
  g.dataset.fontSize = "10";

  let element;

  // 🔥 detectar si es SVG
  if (src.endsWith(".svg") || src.startsWith("data:image/svg")) {
    element = await cargarSVGInline(src);

    element.removeAttribute("width");
    element.removeAttribute("height");
  } else {
    // 🟡 fallback para imágenes normales
    element = document.createElementNS("http://www.w3.org/2000/svg", "image");
    element.setAttribute("href", src);
    element.setAttribute("width", 100);
    element.setAttribute("height", 100);
    element.setAttribute("x", -50);
    element.setAttribute("y", -50);
  }

  g.appendChild(element);

  document.querySelector("#designArea").appendChild(g);

  placeAtCenter(g);
  updateTransform(g);
  autoScaleNewElement(g);
  makeSelectable(g);
  selectElement(g);

  if (window.innerWidth <= 768) {
    closeAssetsPanel();
  }
}

/* =========================
  Convertir imagen a vector
========================= */

function processImageToBW(url, callback) {
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // luminancia
      const brightness = (r + g + b) / 3;

      // 🔥 threshold (podés ajustar 200)
      if (brightness > 200) {
        // fondo → transparente
        data[i + 3] = 0;
      } else {
        // figura → negro
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const finalUrl = canvas.toDataURL("image/png");
    callback(finalUrl);
  };

  img.src = url;
}

/* =========================
   TEXTO
========================= */

function createTextElement() {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  g.setAttribute("data-type", "text");

  // texto inicial
  g.dataset.text = "TU TEXTO";

  // fuente
  g.dataset.font = "AntonSC";

  // 🔥 ahora SIEMPRE será circular
  g.dataset.curved = "true";

  // radio del círculo
  g.dataset.circleRadius = "36";

  // dirección
  g.dataset.curveDir = "1";
  g.dataset.textOffset = "25";
  g.dataset.lockedCircle = "true";

  g.dataset.textAngle = "0";

  // transformaciones
  g.dataset.scale = 1;
  g.dataset.rotation = 0;

  // construir texto
  buildText(g);

  // agregar al grupo principal
  group.appendChild(g);

  // centrar
  placeAtCenter(g);

  // aplicar transform
  updateTransform(g);

  // habilitar interacciones
  makeSelectable(g);

  // seleccionar automáticamente
  selectElement(g);
}

function buildText(g) {
  while (g.firstChild) {
    g.removeChild(g.firstChild);
  }

  const text = g.dataset.text;
  const font = g.dataset.font;
  const fontSize = parseFloat(g.dataset.fontSize) || 10;

  // ===== TEXTO CIRCULAR =====

  const radius = parseFloat(g.dataset.circleRadius) || 38;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  const id = "circle-path-" + crypto.randomUUID();

  const dir = parseFloat(g.dataset.curveDir) || 1;

  let d = "";

  if (dir === 1) {
    // texto normal
    d = `
M 0 0
m 0,${radius}
a ${radius},${radius} 0 1,1 0,-${radius * 2}
a ${radius},${radius} 0 1,1 0,${radius * 2}
`;
  } else {
    // texto invertido
    d = `
M 0 0
m 0,-${radius}
a ${radius},${radius} 0 1,0 0,${radius * 2}
a ${radius},${radius} 0 1,0 0,-${radius * 2}
`;
  }

  path.setAttribute("d", d);

  path.setAttribute("fill", "none");
  path.setAttribute("id", id);

  // 🔥 ocultar path real
  path.style.opacity = "0";

  // =======================
  // CÍRCULO GUÍA VISUAL
  // =======================

  const guide = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  guide.setAttribute("cx", "0");
  guide.setAttribute("cy", "0");
  guide.setAttribute("r", radius);

  guide.setAttribute("fill", "none");

  guide.setAttribute("stroke", "#ececec");

  guide.setAttribute("stroke-width", "0.4");

  guide.setAttribute("stroke-dasharray", "1 1");
  guide.style.pointerEvents = "none";

  // 🔥 importante
  guide.setAttribute("data-ui", "true");

  // =======================
  // TEXTO
  // =======================

  const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");

  textEl.setAttribute("font-family", normalizeFontName(font));

  textEl.style.fontSize = fontSize + "px";
  textEl.style.whiteSpace = "pre";
  // 🔥 mantener texto siempre hacia afuera
  textEl.setAttribute("dy", dir === 1 ? -(fontSize * 0.05) : fontSize * 0.75);

  const textPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "textPath"
  );

  textPath.setAttribute("href", "#" + id);

  // 🔥 centra el texto arriba
  textPath.setAttribute("startOffset", "50%");
  textPath.setAttribute("text-anchor", "middle");

  textPath.textContent = text;

  if (dir === -1) {
    // 🔥 invertir visualmente SIN mover el círculo
    textEl.setAttribute("transform", "rotate(180 0 0)");
  }

  // agregar estructura
  textEl.appendChild(textPath);

  g.appendChild(path);

  g.appendChild(guide);

  g.appendChild(textEl);
}

function preservePositionWhile(el, fn) {
  // centro visual antes
  const before = el.getBBox();
  const beforeCx = before.x + before.width / 2;
  const beforeCy = before.y + before.height / 2;

  // ejecutar el cambio (buildText)
  fn();

  // centro visual después
  const after = el.getBBox();
  const afterCx = after.x + after.width / 2;
  const afterCy = after.y + after.height / 2;

  // compensar diferencia
  const dx = afterCx - beforeCx;
  const dy = afterCy - beforeCy;

  el.dataset.x = (parseFloat(el.dataset.x) || 0) - dx;
  el.dataset.y = (parseFloat(el.dataset.y) || 0) - dy;
}

/* =========================
INPUT TEXTO
========================= */

textInput.addEventListener("input", () => {
  if (!selected || selected.dataset.type !== "text") return;
  selected.dataset.text = textInput.value;
  buildText(selected);
  updateTransform(selected);
});

/* =========================
   BOTONES
========================= */

btnCurveMore.onclick = () => {
  if (!selected || selected.dataset.type !== "text") return;

  let angle = parseFloat(selected.dataset.textAngle) || 0;

  angle += 5;

  if (angle >= 360) {
    angle -= 360;
  }

  selected.dataset.textAngle = angle;

  updateTransform(selected);
};

btnCurveLess.onclick = () => {
  if (!selected || selected.dataset.type !== "text") return;

  let angle = parseFloat(selected.dataset.textAngle) || 0;

  angle -= 5;

  if (angle < 0) {
    angle += 360;
  }

  selected.dataset.textAngle = angle;

  updateTransform(selected);
};

btnInvertCurve.onclick = () => {
  if (!selected) return;

  selected.dataset.curveDir = parseFloat(selected.dataset.curveDir) * -1;

  buildText(selected);
};

const SCALE_STEP = 0.03; // 3% por click (podés bajar a 0.02 si querés más fino)

btnScaleUp.onclick = () => {
  if (!selected) return;

  // 🔥 texto circular
  if (selected.dataset.type === "text") {
    selected.dataset.fontSize =
      (parseFloat(selected.dataset.fontSize) || 10) + 1;

    buildText(selected);
    return;
  }

  // 🔥 imágenes/iconos
  selected.dataset.scale = parseFloat(selected.dataset.scale) + SCALE_STEP;

  updateTransform(selected);
};

btnScaleDown.onclick = () => {
  if (!selected) return;

  // 🔥 texto circular
  if (selected.dataset.type === "text") {
    selected.dataset.fontSize = Math.max(
      4,
      (parseFloat(selected.dataset.fontSize) || 10) - 1
    );

    buildText(selected);
    return;
  }

  // 🔥 imágenes/iconos
  selected.dataset.scale = Math.max(
    0.05,
    parseFloat(selected.dataset.scale) - SCALE_STEP
  );

  updateTransform(selected);
};
/*
btnRotateLeft.onclick = () => {
  if (!selected) return;
  selected.dataset.rotate -= 10;
  updateTransform(selected);
};

btnRotateRight.onclick = () => {
  if (!selected) return;
  selected.dataset.rotate += 10;
  updateTransform(selected);
};
*/

btnDelete.onclick = () => {
  if (!selected) return;
  selected.remove();
  deselect();
};
/*
btnAddText.onclick = () => {
  createTextElement();
};

/* =========================
   PANEL
========================= */

function loadCategory(category) {
  assetsPanel.innerHTML = "";

  if (category === "text") {
    loadFontsPanel();
    return;
  }

  const list = API[category] || [];

  list.forEach((file) => {
    const img = document.createElement("img");
    img.src = `assets/${category}/${file}`;

    img.addEventListener("click", () => {
      createImageElement(img.src, category);
    });

    assetsPanel.appendChild(img);
  });
}

/*
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    loadCategory(tab.dataset.cat);
  });
});

/* =========================
   HELPERS
========================= */

function placeAtCenter(el) {
  const centerX = 60;
  const centerY = 60;

  // 🔥 textos circulares:
  // ya están construidos centrados en 0,0
  if (el.dataset.type === "text") {
    el.dataset.x = centerX;
    el.dataset.y = centerY;
    return;
  }

  // 🔥 SVGs:
  // compensamos offsets reales
  let bbox;

  try {
    bbox = el.getBBox();
  } catch {
    bbox = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
  }

  const contentCenterX = bbox.x + bbox.width / 2;
  const contentCenterY = bbox.y + bbox.height / 2;

  el.dataset.x = centerX - contentCenterX;
  el.dataset.y = centerY - contentCenterY;
}

function getElementCenterInSVG(el) {
  const bbox = el.getBBox();

  // fallback de seguridad (clave para mobile)
  if (!bbox || isNaN(bbox.x) || isNaN(bbox.y)) {
    return { x: 0, y: 0 };
  }

  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };
}

/* =========================
   INIT
========================= */

renderCategories();

/*============================================
Ajustar tamño de svg y texto
==============================================*/

function autoScaleNewElement(el) {
  requestAnimationFrame(() => {
    let bbox;

    try {
      bbox = el.getBBox();
    } catch {
      bbox = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      };
    }
    if (!bbox || bbox.width === 0 || bbox.height === 0) return;

    const category = el.dataset.category;
    const defaultTargetSize = 15;

    const targetSize = CATEGORY_TARGET_SIZES[category] ?? defaultTargetSize;

    const size = Math.max(bbox.width, bbox.height);
    const scale = targetSize / size;

    el.dataset.scale = scale;
    updateTransform(el);
  });
}

/**================================================
 GIZMO DE ESCALAR
================================================== */

function showScaleGizmo(el) {
  if (!el) return;

  // 🔥 borrar el gizmo anterior DEL MISMO ELEMENTO
  const old = el.querySelector(".scale-gizmo");
  if (old) old.remove();

  let bbox;

  try {
    bbox = el.getBBox();
  } catch {
    bbox = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
  }

  // esquina inferior derecha del objeto (espacio local)
  const baseX = bbox.x + bbox.width;
  const baseY = bbox.y + bbox.height;

  const isText = el.dataset.type === "text";

  // =========================
  // 🎛️ CONTROLES VISUALES
  // =========================

  // 👉 tamaño del handle
  const handleRadius = isText
    ? GIZMO_HANDLE_RADIUS * 10 // texto
    : GIZMO_HANDLE_RADIUS; // svg

  // 👉 distancia respecto al objeto
  const handleOffset = isText
    ? -20 // texto → más separado
    : -1; // svg → como siempre

  // posición final del handle
  const handleX = baseX + handleOffset;
  const handleY = baseY + handleOffset;

  // =========================

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.classList.add("scale-gizmo");
  g.dataset.ui = "true";

  const handle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  handle.setAttribute("cx", handleX);
  handle.setAttribute("cy", handleY);
  handle.setAttribute("r", handleRadius);
  handle.setAttribute("fill", "orange");
  handle.style.cursor = "nwse-resize";
  handle.style.pointerEvents = "all";

  g.appendChild(handle);

  // 🔥 vive dentro del objeto
  el.appendChild(g);

  enableScaleGizmo(handle, el);
}

function enableScaleGizmo(handle, el) {
  handle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();

    cachedBBox = el.getBBox();
    cachedCenter = {
      x: cachedBBox.x + cachedBBox.width / 2,
      y: cachedBBox.y + cachedBBox.height / 2,
    };

    const p = getMousePosition(e);
    const startDist = Math.hypot(p.x - cachedCenter.x, p.y - cachedCenter.y);

    activeScale = {
      el,
      center: cachedCenter,
      startDist,
      startScale: parseFloat(el.dataset.scale),
    };

    handle.setPointerCapture(e.pointerId);
  });
}

function showMoveGizmoUnified(el) {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (!el || !isTouch) return;

  // borrar gizmo previo
  const old = gizmoLayer.querySelector(".move-gizmo");
  if (old) old.remove();

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.classList.add("move-gizmo");

  const visualR = 3;
  const touchR = 8;

  const base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  base.setAttribute("r", visualR);
  base.setAttribute("fill", "rgba(245, 244, 244, 0.15)");
  base.setAttribute("stroke", "dodgerblue");
  base.setAttribute("stroke-width", "2");
  base.style.pointerEvents = "none";

  const handle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  handle.setAttribute("r", touchR);
  handle.setAttribute("fill", "transparent");
  handle.style.pointerEvents = "all";
  handle.style.cursor = "grab";
  handle.style.touchAction = "none";

  handle.style.webkitUserSelect = "none";
  handle.style.userSelect = "none";
  handle.setAttribute("fill", "transparent");
  handle.setAttribute("opacity", "1");

  g.appendChild(base);
  g.appendChild(handle);
  gizmoLayer.appendChild(g);

  // posicion inicial
  updateMoveGizmoPosition(el);

  enableMoveGizmoUnified(handle, el);
}

//
function enableMoveGizmoUnified(handle, el) {
  handle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    e.preventDefault();

    activeMove = {
      el,
      last: getMousePosition(e),
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", onPointerUp, {
      passive: false,
    });
  });

  function onPointerMove(e) {
    if (!activeMove) return;

    e.preventDefault();

    console.log("MOVIENDO"); // ahora esto SÍ debería aparecer

    const current = getMousePosition(e);

    const dx = current.x - activeMove.last.x;
    const dy = current.y - activeMove.last.y;

    moveElement(activeMove.el, dx, dy);

    activeMove.last = current;

    updateMoveGizmoPosition(activeMove.el);
  }

  function onPointerUp() {
    activeMove = null;

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
}

function moveElement(el, dx, dy) {
  el.dataset.x = (parseFloat(el.dataset.x) || 0) + dx;
  el.dataset.y = (parseFloat(el.dataset.y) || 0) + dy;

  updateTransform(el);
}

//
function updateMoveGizmoPosition(el) {
  const gizmo = gizmoLayer.querySelector(".move-gizmo");
  if (!gizmo) return;

  const bbox = el.getBBox();

  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const x = parseFloat(el.dataset.x) || 0;
  const y = parseFloat(el.dataset.y) || 0;

  // 🔥 usamos la misma lógica que updateTransform
  gizmo.setAttribute("transform", `translate(${cx + x}, ${cy + y})`);
}
/*========== exportar diseño ============ */

async function loadFontAsBase64(url) {
  const response = await fetch(url);

  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

async function exportCleanSVG(originalSvg) {
  const ns = "http://www.w3.org/2000/svg";

  const exportSvg = document.createElementNS(ns, "svg");

  exportSvg.setAttribute("xmlns", ns);

  const viewBox = originalSvg.getAttribute("viewBox");

  if (viewBox) {
    exportSvg.setAttribute("viewBox", viewBox);
  }

  // =========================
  // EMBEBER FUENTES
  // =========================

  const defs = document.createElementNS(ns, "defs");

  const style = document.createElementNS(ns, "style");

  let fontCSS = "";

  for (const [fontName, fontUrl] of Object.entries(FONT_FILES)) {
    try {
      const base64Font = await loadFontAsBase64(fontUrl);

      fontCSS += `
      @font-face {
        font-family: '${normalizeFontName(fontName)}';
        src: url('${base64Font}');
      }
    `;
    } catch (err) {
      console.warn("No se pudo embeber fuente:", fontName);
    }
  }

  style.textContent = fontCSS;

  defs.appendChild(style);

  exportSvg.appendChild(defs);

  // 🔥 SOLO elementos reales del diseño
  originalSvg.querySelectorAll("g[data-type]").forEach((group) => {
    const cleanGroup = document.createElementNS(ns, "g");

    // mantener transformaciones
    if (group.hasAttribute("transform")) {
      cleanGroup.setAttribute("transform", group.getAttribute("transform"));
    }

    // copiar hijos válidos
    Array.from(group.children).forEach((node) => {
      // ignorar UI
      if (node.getAttribute?.("data-ui") === "true") {
        return;
      }

      // ignorar gizmos
      if (
        node.classList?.contains("rotate-gizmo") ||
        node.classList?.contains("scale-gizmo") ||
        node.classList?.contains("move-gizmo")
      ) {
        return;
      }

      // ignorar círculos guía
      if (node.tagName === "circle") {
        return;
      }

      cleanGroup.appendChild(node.cloneNode(true));
    });

    // agregar solo si tiene contenido
    if (cleanGroup.children.length > 0) {
      exportSvg.appendChild(cleanGroup);
    }
  });

  return new XMLSerializer().serializeToString(exportSvg);
}

function downloadSVG(svgString, filename = "diseno.svg") {
  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function svgToPng(svgString, width = 2000, height = 2000) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      // fondo transparente
      ctx.clearRect(0, 0, width, height);

      // dibujar SVG
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);

          resolve(blob);
        },
        "image/png",
        1.0
      );
    };

    img.onerror = reject;

    img.src = url;
  });
}

async function generateDesignPreview() {
  try {
    const svg = document.querySelector("#designArea");

    if (!svg) return;

    const svgClone = svg.cloneNode(true);

    const cleanSVG = await exportCleanSVG(svgClone);

    const blob = await svgToPng(cleanSVG, 1000, 1000);

    const url = URL.createObjectURL(blob);

    const preview = document.getElementById("designPreview");

    preview.src = url;
  } catch (error) {
    console.error("Error generando preview:", error);
  }
}

/**=======================ENVIAR AL BACKEND===================================== */

async function convertAllTextToPaths(svgClone) {
  const textGroups = svgClone.querySelectorAll('g[data-type="text"]');

  for (const g of textGroups) {
    await textToPath(g);
  }
}
function svgStringToFile(svgString, filename = "diseno.svg") {
  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  return new File([blob], filename, {
    type: "image/svg+xml;charset=utf-8",
  });
}

async function getNextDesignFileName(orderNumber) {
  const folderRef = firebase.storage().ref().child("Diseños");

  let version = 1;

  while (true) {
    const fileName = `diseno_${orderNumber}_${version}.png`;
    const fileRef = folderRef.child(fileName);

    try {
      await fileRef.getDownloadURL();
      version++;
    } catch (error) {
      return fileName;
    }
  }
}

async function exportDesignToBackend(orderNumber, clientData) {
  console.log("🚀 Exportando diseño al backend:", orderNumber);

  const loadingOverlay = document.getElementById("loadingOverlay");
  const svg = document.querySelector("#designArea");

  if (!svg) {
    console.error("❌ SVG no encontrado");
    return;
  }

  if (!orderNumber) {
    console.error("❌ Falta orderNumber");
    return;
  }

  try {
    // MOSTRAR LOADER
    loadingOverlay.classList.remove("hidden");

    const svgClone = svg.cloneNode(true);

    const cleanSVG = await exportCleanSVG(svgClone);

    const blob = await svgToPng(cleanSVG, 3000, 3000);

    // 🔢 BUSCAR EL SIGUIENTE NÚMERO DISPONIBLE
    const fileName = await getNextDesignFileName(orderNumber);

    console.log("📁 Nombre generado:", fileName);

    // 📁 REFERENCIA A FIREBASE STORAGE
    const storageRef = firebase.storage().ref().child(`Diseños/${fileName}`);

    // SUBIR IMAGEN
    await storageRef.put(blob);

    // OBTENER URL
    const urlImage = await storageRef.getDownloadURL();

    // ENVIAR AL BACKEND
    const response = await axios.post(
      "https://matesparana-backend-production.up.railway.app/designs",
      {
        image: urlImage,
        orderNumber,
        delivered: clientData.delivered,
        observations: clientData.observations,
      }
    );

    console.log("✅ Respuesta backend:", response.data);

    showSuccessToast("✅ El diseño fue enviado con éxito");
  } catch (error) {
    console.error("❌ Error exportando:", error);
  } finally {
    // OCULTAR LOADER SIEMPRE
    loadingOverlay.classList.add("hidden");
  }
}

/**=======================================NUEVAS FUNCIONES============================================================= */

function renderCategories() {
  assetsPanel.innerHTML = "";

  Object.keys(API).forEach((category) => {
    const card = document.createElement("div");
    card.className = "category-card";

    // HEADER
    const header = document.createElement("div");
    header.className = "category-header";

    const title = document.createElement("h4");
    title.textContent = category.toUpperCase();

    const btn = document.createElement("button");
    btn.className = "ver-todos";
    btn.textContent = "Ver todos";

    header.appendChild(title);
    header.appendChild(btn);

    // PREVIEW
    const preview = document.createElement("div");
    preview.className = "category-preview";

    const items = API[category];

    items.slice(0, 3).forEach((file) => {
      const img = document.createElement("img");
      img.src = `assets/${category}/${file}`;

      img.addEventListener("click", () => {
        createImageElement(img.src, category);
      });

      preview.appendChild(img);
    });

    // CLICK VER TODOS
    btn.addEventListener("click", () => {
      renderFullCategory(category);
    });

    card.appendChild(header);
    card.appendChild(preview);

    assetsPanel.appendChild(card);
  });
}

function renderFullCategory(category) {
  assetsPanel.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Volver";
  backBtn.className = "ver-todos";

  backBtn.onclick = () => renderCategories();

  assetsPanel.appendChild(backBtn);

  const grid = document.createElement("div");
  grid.className = "category-full";

  const list = API[category];

  list.forEach((file) => {
    const img = document.createElement("img");
    img.src = `assets/${category}/${file}`;

    img.addEventListener("click", () => {
      createImageElement(img.src, category);
    });

    grid.appendChild(img);
  });

  assetsPanel.appendChild(grid);
}

/*========================SIDEBAR 3 BOTONES============================= */

function setActiveButton(index) {
  const buttons = document.querySelectorAll(".sidebar-top button");

  if (!buttons || buttons.length === 0) return;

  buttons.forEach((b) => {
    if (b) b.classList.remove("active");
  });

  if (buttons[index]) {
    buttons[index].classList.add("active");
  }
}

function closeAssetsPanel() {
  if (!assetsPanel) return;
  assetsPanel.classList.add("open");
}

function closeAssetsPanel() {
  if (!assetsPanel) return;
  assetsPanel.classList.remove("open");
}

function showUpload() {
  setActiveButton(2);
  assetsPanel.classList.add("open");

  assetsPanel.innerHTML = "";

  const label = document.createElement("label");

  label.className = "upload-btn";
  label.textContent = "Seleccionar imagen";

  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";
  input.hidden = true;

  input.onchange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      const base64 = ev.target.result;

      // 🔥 AHORA SÍ
      processImageToBW(base64, (processedUrl) => {
        createImageElement(processedUrl, "upload");
      });
    };

    reader.readAsDataURL(file);
  };

  label.appendChild(input);

  assetsPanel.appendChild(label);

  const warning = document.createElement("p");

  warning.className = "upload-warning";

  warning.textContent =
    "IMPORTANTE: se recomienda seleccionar imágenes negras con fondo blanco para mejores resultados, tambien recomendamos usar Pinteres para buscar imagenes";

  assetsPanel.appendChild(warning);
}

function showIcons() {
  console.log("iconos funcionando");

  setActiveButton(0);

  assetsPanel.classList.add("open");

  renderCategories();
}

function showText() {
  setActiveButton(1);
  assetsPanel.classList.add("open");
  assetsPanel.innerHTML = "";

  // BOTON AGREGAR TEXTO
  const btn = document.createElement("button");
  btn.textContent = "Agregar texto";
  btn.className = "add-text-btn";
  btn.onclick = () => createTextElement();

  assetsPanel.appendChild(btn);

  // CONTENEDOR FUENTES
  const fontsContainer = document.createElement("div");
  fontsContainer.className = "fonts-list";

  FONTS.forEach((font) => {
    const item = document.createElement("div");

    item.textContent = font;
    item.style.fontFamily = `'${font}', AntonSC`;
    item.style.cursor = "pointer";
    item.style.padding = "8px";
    item.style.borderRadius = "8px";
    item.style.textAlign = "center";
    item.style.background = "#f1f1f1";
    item.style.transition = "0.2s";

    item.onmouseenter = () => {
      item.style.background = "#ddd";
    };

    item.onmouseleave = () => {
      item.style.background = "#f1f1f1";
    };

    item.onclick = () => {
      // 🔥 Remover selección previa
      document.querySelectorAll(".fonts-list div").forEach((el) => {
        el.classList.remove("active-font");
      });

      // 🔥 Marcar esta como activa
      item.classList.add("active-font");

      // Aplicar al texto seleccionado
      if (selected && selected.dataset.type === "text") {
        selected.dataset.font = font;

        buildText(selected);
        updateTransform(selected);
      }
    };

    fontsContainer.appendChild(item);
  });

  assetsPanel.appendChild(fontsContainer);
}

/*========AVISO EXPORTACION=============== */
function showSuccessToast(message) {
  const toast = document.getElementById("toastSuccess");

  if (!toast) {
    console.error("❌ No existe #toastSuccess");
    return;
  }

  toast.textContent = message;

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

/*===================== Cambiar id de los svg========================== */
// IMPORTANTE:
// Los SVG pueden traer ids internos repetidos
// (clipPath, mask, gradient, filter, etc.).
// Esta función renombra todos los ids y sus referencias
// para evitar colisiones cuando varios SVG se insertan
// en el mismo editor.

function makeSvgIdsUnique(svg) {
  const suffix =
    window.crypto && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);

  const idMap = new Map();

  // Guardamos todos los ids y los renombramos
  svg.querySelectorAll("[id]").forEach((el) => {
    const oldId = el.id;
    const newId = `${oldId}-${suffix}`;

    idMap.set(oldId, newId);
    el.id = newId;
  });

  // Actualizamos todas las referencias a los IDs
  const attrs = [
    "fill",
    "stroke",
    "filter",
    "clip-path",
    "mask",
    "href",
    "xlink:href",
  ];

  svg.querySelectorAll("*").forEach((el) => {
    attrs.forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;

      idMap.forEach((newId, oldId) => {
        if (value.includes(`#${oldId}`)) {
          el.setAttribute(attr, value.replaceAll(`#${oldId}`, `#${newId}`));
        }
      });
    });

    // También actualiza estilos inline
    const style = el.getAttribute("style");
    if (style) {
      let newStyle = style;
      idMap.forEach((newId, oldId) => {
        newStyle = newStyle.replaceAll(`url(#${oldId})`, `url(#${newId})`);
      });
      el.setAttribute("style", newStyle);
    }
  });

  return svg;
}
