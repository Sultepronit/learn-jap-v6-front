import { toCamelCase } from "../helpers/text"

class SmartRef {
    el: HTMLElement

    #htmlCache = ""

    constructor(el: HTMLElement) {
        this.el = el
    }

    text(val: string | number, isHtml = false) {
        if (isHtml) return this.html(val as string)

        const str = typeof val === "string" ? val : val.toString()
        if (val !== this.el.textContent) this.el.textContent = str
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

    replaceClasses(classes: string[]) {
        this.el.className = classes.join(" ")
        return this
    }
}

export default class BaseComponent<TKeys extends string> extends HTMLElement {
    refs = {} as Record<TKeys, SmartRef>

    collectRefs() {
        const refs = this.querySelectorAll<HTMLElement>("[data-ref]")
        // const refs = this.querySelectorAll<HTMLElement>(":scope > [data-ref]")
        refs.forEach(el => {
            const kebab = el.dataset.ref
            this.refs[toCamelCase(kebab)] = new SmartRef(el)
        })
        console.log(this.refs)
    }
}
