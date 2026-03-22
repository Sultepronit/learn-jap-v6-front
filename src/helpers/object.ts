export function isGetter(obj: Object, field: string) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, field)
    return descriptor?.get
}

export function defineProperty(obj: Object, field: string, value: any) {
    Object.defineProperty(obj, field, {
        value,
        writable: true,
        configurable: true
    })
}
