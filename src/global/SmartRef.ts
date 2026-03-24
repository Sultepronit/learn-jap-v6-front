export default class SmartRef {
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
