import template from "./words-session.html?raw"
import "./words-session.css"
import type { CombinedWord, StyledText } from "../types"
import { getNext } from "./sessionData"
import { EVT, on } from "../../global/events"
import { computeAll } from "../parsers/readingsWritings"
import { emitLwe, LWE, onLwe } from "./events"
import BaseComponent from "../../global/BaseComponent"
import { genRandomInt } from "../../helpers/random"

type RefKeys = "card" | "buttons"
export default class WordsSession extends BaseComponent<RefKeys> {
    word: CombinedWord
    wordV = 0
    // stage: "question" | "hint" | "answer"

    async connectedCallback() {
        this.innerHTML = template

        // this.collectRefs()
        // console.log(this.refs)

        // onLwe(LWE.NEXT_WORD, e => this.ask(e))
        onLwe(LWE.NEXT_WORD, w => {
            this.word = w
            this.wordV = w.v
            // console.log(this.word)
        })

        await getNext()
        on(EVT.WORD_UPDATED, () => {
            // console.log(this.word)
            // console.log(this.word.v)
            if (this.word.v === this.wordV) return
            // console.warn("CHANGE!")
            emitLwe(LWE.WORD_UPDATED)
        })

        // setInterval(getNext, 5000)
    }

    // ask(word: CombinedWord) {
    //     this.word = word
    //     this.stage = this.word.comp.auto ? "answer" : "question"
    //     // this.stage = "question"
    //     // this.stage = "hint"
    //     // this.stage = "answer"
    //     // this.updateCardContent()
    //     this.updateCardView()
    // }
}
