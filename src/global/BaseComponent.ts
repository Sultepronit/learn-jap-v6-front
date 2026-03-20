import { toCamelCase } from "../helpers/text"

class SmartRef {
    el: HTMLElement

    #htmlCache = ""

    constructor(el: HTMLElement) {
        this.el = el
    }

    text(val: string) {
        if (val !== this.el.textContent) this.el.textContent = val
        return this
    }

    html(val: string) {
        if (val !== this.#htmlCache) {
            this.#htmlCache = val
            this.el.innerHTML = val
        }
        return this
    }

    hide() {
        this.el.classList.add("hidden")
        return this
    }

    show() {
        this.el.classList.remove("hidden")
        return this
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
            const kebab = el.dataset.ref
            this.refs[toCamelCase(kebab)] = new SmartRef(el)
        })
    }
}
