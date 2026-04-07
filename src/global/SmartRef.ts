export default class SmartRef {
    el: HTMLElement

    #htmlCache = ""

    constructor(el: HTMLElement) {
        this.el = el
    }

    get elAsInput() {
        return this.el as HTMLInputElement
    }

    text(val: string | number | undefined, isHtml = false) {
        if (isHtml) return this.html(val as string)

        const str = typeof val === "string" ? val : val === undefined ? "" : val.toString()
        if (str !== this.el.textContent) {
            this.el.textContent = str
            this.#htmlCache = ""
        }
        return this
    }

    html(val: string | undefined) {
        if (val === undefined) val = ""
        if (val !== this.#htmlCache) {
            this.#htmlCache = val
            this.el.innerHTML = val
        }
        return this
    }

    get value(): string {
        return (this.el as HTMLInputElement).value
    }

    set value(val: string | number) {
        const str = typeof val === "string" ? val : val.toString()
        if (str !== (this.el as HTMLInputElement).value) {
            ;(this.el as HTMLInputElement).value = str
        }
    }

    hide() {
        this.el.classList.add("hidden")
        return this
    }

    show() {
        this.el.classList.remove("hidden")
        return this
    }

    on(eventName: string, action: (e?: Event) => void, options?: AddEventListenerOptions) {
        this.el.addEventListener(eventName, action, options)
    }

    addClass(className: string) {
        this.el.classList.add(className)
        return this
    }

    removeClass(className: string) {
        this.el.classList.remove(className)
        return this
    }

    toggleClass(className: string) {
        this.el.classList.toggle(className)
        return this
    }

    replaceClasses(classes: string[]) {
        this.el.className = classes.join(" ")
        return this
    }
}
