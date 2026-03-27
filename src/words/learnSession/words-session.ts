import template from "./words-session.html?raw"
import "./words-session.css"
import type { CombinedWord } from "../types"
import { getNext, initSession } from "./sessionData"
import { emit, EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"

type RefKeys = "card" | "buttons"
export default class WordsSession extends BaseComponent<RefKeys> {
    word: CombinedWord
    wordV = 0

    async connectedCallback() {
        this.innerHTML = template

        // this.collectRefs()
        // console.log(this.refs)

        // onLwe(LWE.NEXT_WORD, w => {
        on(EVT.WS.NEXT_CARD, w => {
            this.word = w
            this.wordV = w.v
        })

        // await getNext()
        await initSession()
        on(EVT.WORD_UPDATED, () => {
            // console.log(this.word)
            // console.log(this.word.v)
            if (!this.word || this.word.v === this.wordV) return
            // emitLwe(LWE.WORD_UPDATED)
            emit(EVT.WS.WORD_UPDATED)
        })
    }
}
