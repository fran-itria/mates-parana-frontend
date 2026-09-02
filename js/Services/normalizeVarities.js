export function normalizeVarities(varities, detectColor) {
    return varities.map((v) => ({
        ...v,

        color: detectColor(
            `${v.color || ""} ${v.name || ""} ${v.description || ""}`
        ),
    }));
}