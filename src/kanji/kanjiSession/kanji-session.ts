import template from "./kanji-session.html?raw"
import "./kanji-session.css"

import { initSession } from "./sessionData"
import { emit, EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"
import type { CombinedKanji } from "../types"

type RefKeys = "mainView" | "endView" | "reset"
export default class KanjiSession extends BaseComponent<RefKeys> {
    k: CombinedKanji
    kV = 0

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs(["kanji-session-stats", "kanji-card", "kanji-buttons"])
        console.log(this.refs)
        // rewrite
        // this.refs.reset.on("click", () => emit(EVT.WS.RESET_REQUESTED))

        // rewrite
        // on(EVT.WS.ENDED, () => {
        //     this.refs.mainView.hide()
        //     this.refs.endView.show()
        // })

        // remove
        // on(EVT.WS.NEXT_CARD, w => {
        //     this.k = w
        //     this.kV = w.v
        // })

        await initSession()
        // remove
        // on(EVT.WORD_UPDATED, () => {
        //     // do we need all this things?
        //     if (!this.k || this.k.v === this.kV) return
        //     emit(EVT.WS.WORD_UPDATED)
        // })
    }
}
