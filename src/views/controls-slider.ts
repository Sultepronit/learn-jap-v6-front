import template from "./controls-slider.html?raw"
import "./controls-slider.css"

import BaseComponent from "../global/BaseComponent"
import { emit, EVT } from "../global/events"

type RefKeys = "caller" | "controls"
export default class ControlsSlider extends BaseComponent<RefKeys> {
    start = 0
    end = 0

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        this.addEventListener("click", (e: Event) => {
            const btn = e.target as HTMLButtonElement
            if (btn.localName !== "button") return
            console.log(btn.name)
            if (btn.name === "ws-reset") {
                emit(EVT.WS.RESET_REQUESTED)
            }
            this.hideControls()
        })

        // this.refs.caller.on(
        document.body.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
                // e.preventDefault()
                this.start = e.changedTouches[0].screenY
                // if (this.start > window.innerHeight / 4)
            }
            // { passive: false }
        )

        // this.refs.caller.on(
        document.body.addEventListener(
            "touchend",
            (e: TouchEvent) => {
                // e.preventDefault()
                this.handleSwipe(e.changedTouches[0].screenY)
            }
            // { passive: false }
        )
    }

    handleSwipe(end: number) {
        console.log(window.innerHeight / 3)
        // console.log(window.innerHeight)
        // console.log(window.outerHeight)
        // alert(`${this.start} - ${end}`)
        console.log(this.start, end)
        // alert(end - this.start)
        if (this.start > window.innerHeight / 3) return
        if (end - this.start < 100) return

        this.showControls()
    }

    showControls() {
        this.refs.controls.show()
        // document.addEventListener("click", (e: MouseEvent) => {
        //     // if (e.target === this) return
        //     if ((e.target as HTMLElement).closest('[data-ref="controls"]')) return
        //     console.log(e.target)
        //     this.refs.controls.hide()
        // })
        // document.addEventListener("click", this.hideControls)
        document.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('[data-ref="controls"]')) return
            this.hideControls()
        })
    }

    // hideControls = () => {
    hideControls() {
        // if ((e.target as HTMLElement).closest('[data-ref="controls"]')) return
        // console.log(e.target)
        this.refs.controls.hide()
        document.removeEventListener("click", this.hideControls)
    }
}
