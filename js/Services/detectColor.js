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
    marron_claro: ["marron claro"],
    marron_oscuro: ["marron oscuro"],
    beige: ["beige"],
    azul_marino: ["azul marino"],
    cremita: ["cremita"],
    rojo: ["rojo"],
    bordo: ["bordo"],
    amarillo: ["amarillo"],
  };

  for (const [key, aliases] of Object.entries(colors)) {
    if (aliases.some((alias) => text.includes(alias))) {
      if (key.includes("_")) {
        return key.split("_").join(" ");
      } else return key;
    }
  }

  return null;
}
