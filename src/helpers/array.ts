export function areArraysEqual(a: any[], b: any[]) {
    if (!a || !b) return false
    if (a.length !== b.length) return false
    return a.every((v, i) => v === b[i])
}
