import template from "./kanji-session.html?raw"
import endTemplate from "../../views/learnSession/end-view.html?raw"
import "./kanji-session.css"

import { initSession } from "./sessionData"
import BaseComponent from "../../global/BaseComponent"
import { emit, EVT, on } from "../../global/events"

type RefKeys = "mainView" | "endView" | "reset"
export default class KanjiSession extends BaseComponent<RefKeys> {
    async connectedCallback() {
        this.innerHTML = template + endTemplate

        this.collectRefs(["kanji-session-stats", "kanji-card", "kanji-buttons"])
        // console.log(this.refs)

        this.refs.reset.on("click", () => {
            emit(EVT.KS.RESET_REQUESTED)
            this.refs.mainView.show()
            this.refs.endView.hide()
        })

        on(EVT.KS.ENDED, () => {
            this.refs.mainView.hide()
            this.refs.endView.show()
        })

        await initSession()
    }
}
