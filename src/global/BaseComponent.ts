import { toCamelCase } from "../helpers/text"
import SmartRef from "./SmartRef"

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
