export function normalizeVarities(varities, detectColor) {
    return varities.map((v) => {
        return ({
            ...v,
            color: detectColor(
                `${v.color || ""} ${v.name || ""} ${v.description || ""}`
            ),
        })
    });
}