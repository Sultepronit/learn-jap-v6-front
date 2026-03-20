class SmartRef {
    el: HTMLElement

    constructor(el: HTMLElement) {
        this.el = el
    }

    text(val: string) {
        if (val !== this.el.textContent) this.el.textContent = val
        return this.el
    }

    hide() {
        this.el.classList.add(".hidden")
    }

    show() {
        this.el.classList.remove(".hidden")
    }
}

// export default class BaseComponent extends HTMLElement {
// export default class BaseComponent<TRefs extends Record<string, SmartRef>> extends HTMLElement {
export default class BaseComponent<TKeys extends string> extends HTMLElement {
    // refs: Record<string, HTMLElement> = {}
    // refs: Record<string, SmartRef> = {}
    refs = {} as Record<TKeys, SmartRef>

    collectRefs() {
        const refs = this.querySelectorAll<HTMLElement>("[data-ref]")
        refs.forEach(el => {
            const name = el.dataset.ref
            this.refs[name] = new SmartRef(el)
        })
    }
}
