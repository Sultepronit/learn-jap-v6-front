import template from "./words-session.html?raw"
import endTemplate from "../../views/learnSession/end-view.html?raw"
import "./words-session.css"

import { initSession } from "./sessionData"
import { emit, EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"

type RefKeys = "mainView" | "endView" | "reset"
export default class WordsSession extends BaseComponent<RefKeys> {
    // word: CombinedWord
    // wordV = 0

    async connectedCallback() {
        this.innerHTML = template + endTemplate

        this.collectRefs(["words-session-stats", "word-card", "word-buttons"])
        // console.log(this.refs)

        this.refs.reset.on("click", () => {
            emit(EVT.WS.RESET_REQUESTED)
            this.refs.mainView.show()
            this.refs.endView.hide()
        })

        on(EVT.WS.ENDED, () => {
            this.refs.mainView.hide()
            this.refs.endView.show()
        })

        await initSession()
    }
}
