export function toCamelCase(kebab: string) {
    return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

export function getUniqueKanji(text: string) {
    const matches = text.match(/(?!々)\p{Script=Han}/gu) || []
    return [...new Set(matches)]
}
