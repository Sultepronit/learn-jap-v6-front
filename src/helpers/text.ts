export function toCamelCase(kebab: string) {
    return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

export function getUniqueKanji(text: string) {
    const matches = text.match(/\p{Script=Han}/gu) || []
    return [...new Set(matches)]
}

// console.log(getUniqueKanji("日本語を勉強しています。日本は美しいです。"))
