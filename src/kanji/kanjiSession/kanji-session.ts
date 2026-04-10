import template from "./kanji-session.html?raw"
import "./kanji-session.css"

import { initSession } from "./sessionData"
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

        await initSession()
    }
}
