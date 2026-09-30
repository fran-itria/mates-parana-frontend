const CASA_CENTRAL = "sucursal casa central";

// Una variedad se puede elegir si tiene stock en Casa Central.
// Si la variedad no trae info de stock, no se bloquea.
export function hasCentralStock(varity) {
    if (!Array.isArray(varity?.stock)) return true;

    const central = varity.stock.find(
        (s) => String(s.sucursal || "").toLowerCase() === CASA_CENTRAL
    );

    return Number(central?.quantity) > 0;
}
