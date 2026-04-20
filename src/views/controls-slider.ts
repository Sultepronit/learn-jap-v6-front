import template from "./controls-slider.html?raw"
import "./controls-slider.css"

import BaseComponent from "../global/BaseComponent"
import { emit, EVT, on, type EventName } from "../global/events"
import type { BigView } from "../global/types"
import syncParams from "../global/syncParams"

type RefKeys = "sessionControls" | "syncInterval" | "syncDisplay" | "syncOn"
export default class ControlsSlider extends BaseComponent<RefKeys> {
    start = 0
    sessionReset: EventName

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        this.refs.syncInterval.value = syncParams.timeout
        this.refs.syncDisplay.text(syncParams.timeout)

        this.refs.syncInterval.on("input", e => {
            const val = (e.target as HTMLInputElement).value
            this.refs.syncDisplay.text(val)
            syncParams.set("timeout", Number(val))
        })

        this.refs.syncOn.elAsInput.checked = syncParams.turnedOn
        this.refs.syncOn.on("input", () => {
            const checked = this.refs.syncOn.elAsInput.checked
            syncParams.set("turnedOn", checked)

            if (checked) emit(EVT.SYNC_REQUESTED)

            emit(EVT.SYNC_STATUS_CHANGED, "stale")
        })

        // all the buttons
        this.addEventListener("click", (e: Event) => {
            const btn = e.target as HTMLButtonElement
            if (btn.localName !== "button") return
            console.log(btn.name)

            if (btn.name === "session-reset") emit(this.sessionReset)
            if (btn.name === "sync") emit(EVT.SYNC_REQUESTED)
            if (btn.name === "pronunciation") {
                // btn.textContent = btn.textContent === "🔇" ? "🔊" : "🔇"
                if (btn.textContent === "🔇") {
                    btn.textContent = "🔊"
                    emit(EVT.LOUDNESS_TOGGLED, true)
                } else {
                    btn.textContent = "🔇"
                    emit(EVT.LOUDNESS_TOGGLED, false)
                }
            }

            setTimeout(() => this.hideControls(), 400)
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
