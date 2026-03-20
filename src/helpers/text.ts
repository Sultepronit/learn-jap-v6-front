export function toCamelCase(kebab: string) {
    return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}
