export function detectColor(text = "") {
  text = text.toLowerCase();

  const colors = {
    negro: ["negro"],
    borravino: ["borravino"],
    chocolate: ["chocolate"],
    madera: ["color madera"],
    blanco: ["blanco"],
    verde: ["verde"],
    violeta: ["violeta"],
    gris: ["gris"],
    rosado: ["rosado"],
    azul: ["azul"],
    aqua: ["aqua"],
    marronClaro: ["marron claro"],
    marronOscuro: ["marron oscuro"],
    beige: ["beige"],
    azulMarino: ["azul marino"],
    cremita: ["cremita"],
    rojo: ["rojo"],
    bordo: ["bordo"],
    amarillo: ["amarillo"],
  };

  for (const [key, aliases] of Object.entries(colors)) {
    if (aliases.some((alias) => text.includes(alias))) {
      return key;
    }
  }

  return null;
}
