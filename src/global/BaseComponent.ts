import { toCamelCase } from "../helpers/text"
import SmartRef from "./SmartRef"

export default class BaseComponent<TKeys extends string> extends HTMLElement {
    refs = {} as Record<TKeys, SmartRef>

    collectRefs(ignore: string[] = null) {
        const refs = this.querySelectorAll<HTMLElement>("[data-ref]")
        refs.forEach(el => {
            for (const tag of ignore || []) {
                const foreign = el.closest(tag)
                if (foreign) return
            }
            const kebab = el.dataset.ref
            // console.log(el.parentElement)
            this.refs[toCamelCase(kebab)] = new SmartRef(el)
        })
        // console.log(this.refs)
    }

    hide() {
        this.classList.add("hidden")
    }

    show() {
        this.classList.remove("hidden")
    }
}
