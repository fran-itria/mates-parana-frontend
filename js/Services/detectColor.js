export function detectColor(text = "") {
    text = text.toLowerCase();

    const colors = {
        negro: ["negro"],

        blanco: ["blanco"],

        rojo: ["rojo"],

        rojoOscuro: ["rojo oscuro"],

        rosa: ["rosa", "pink"],

        marron: ["marron", "marrón"],

        marronClaro: ["marron claro", "marrón claro"],

        marronOscuro: ["marron oscuro", "marrón oscuro"],

        beige: ["beige", "nude"],

        verde: ["verde"],

        azul: ["azul"],

        amarillo: ["amarillo"],

        violeta: ["violeta", "lila"],

        gris: ["gris"],

        chocolate: ["chocolate", "marronoscuro"],

        borravino: ["bordo", "borra vino", "borravino", "vino"],
    };

    for (const [key, aliases] of Object.entries(colors)) {
        if (aliases.some((alias) => text.includes(alias))) {
            return key;
        }
    }

    return null;
}