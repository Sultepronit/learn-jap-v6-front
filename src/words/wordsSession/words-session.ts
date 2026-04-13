import template from "./words-session.html?raw"
import "./words-session.css"
import type { CombinedWord } from "../types"
import { initSession } from "./sessionData"
import { emit, EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"

type RefKeys = "mainView" | "endView" | "reset"
export default class WordsSession extends BaseComponent<RefKeys> {
    word: CombinedWord
    wordV = 0

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs(["words-session-stats", "word-card", "word-buttons"])
        // console.log(this.refs)
        this.refs.reset.on("click", () => emit(EVT.WS.RESET_REQUESTED))

        on(EVT.WS.ENDED, () => {
            this.refs.mainView.hide()
            this.refs.endView.show()
        })

        on(EVT.WS.NEXT_CARD, w => {
            this.word = w
            this.wordV = w.v
        })

        await initSession()
        on(EVT.WORD_UPDATED, () => {
            // do we need all this things?
            if (!this.word || this.word.v === this.wordV) return
            emit(EVT.WS.WORD_UPDATED)
        })
    }
}
