import template from "./controls-slider.html?raw"
import "./controls-slider.css"

import BaseComponent from "../global/BaseComponent"
import { emit, EVT, on, type EventName } from "../global/events"
import type { BigView } from "../global/types"

type RefKeys = "sessionControls"
export default class ControlsSlider extends BaseComponent<RefKeys> {
    start = 0
    sessionReset: EventName

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        this.addEventListener("click", (e: Event) => {
            const btn = e.target as HTMLButtonElement
            if (btn.localName !== "button") return
            console.log(btn.name)
            if (btn.name === "session-reset") {
                // emit(EVT.WS.RESET_REQUESTED)
                emit(this.sessionReset)
            }
            this.hideControls()
        })

        on(EVT.VIEW_SHOWN, view => this.updateToView(view))

        document.body.addEventListener("touchstart", (e: TouchEvent) => {
            this.start = e.changedTouches[0].screenY
        })

        document.body.addEventListener("touchend", (e: TouchEvent) => {
            this.handleSwipe(e.changedTouches[0].screenY)
        })
    }

    handleSwipe(end: number) {
        if (this.start > window.innerHeight / 3) return
        if (end - this.start < 100) return

        this.showControls()
    }

    updateToView(view: BigView) {
        // console.log(view)
        switch (view) {
            case "words-session":
                this.refs.sessionControls.show()
                this.sessionReset = EVT.WS.RESET_REQUESTED
                break
            case "kanji-session":
                this.refs.sessionControls.show()
                this.sessionReset = EVT.KS.RESET_REQUESTED
                break
            default:
                this.refs.sessionControls.hide()
                break
        }
    }

    showControls() {
        this.show()
        document.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest("controls-slider")) return
            this.hideControls()
        })
    }

    hideControls() {
        this.hide()
        document.removeEventListener("click", this.hideControls)
    }
}
