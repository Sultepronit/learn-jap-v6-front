import template from "./word-buttons.html?raw"

import BaseComponent from "../../global/BaseComponent"
import type { CombinedWord } from "../types"
import { emitLwe, LWE, onLwe, type EventName } from "./events"

type RefKeys = "pass"
export default class WordButtons extends BaseComponent<RefKeys> {
    word: CombinedWord
    action: () => void
    event: EventName

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        // onLwe(LWE.NEXT_WORD, w => (this.word = w))
        onLwe(LWE.NEXT_WORD, this.setNext)
        onLwe(LWE.HINT_REQUESTED, () => {
            this.event = LWE.ANSWER_REQUESTED
        })

        this.addEventListener("click", e => {
            // console.log(e)
            // console.log(e.target)
            const t = e.target as HTMLButtonElement
            if (t.localName !== "button") return
            // console.log(t.name)
            this.handleClick(t.name)
        })
    }

    setNext = (word: CombinedWord) => {
        this.word = word
        console.log("set!", this.word)
        if (this.word.comp.auto) {
            // this.action = () => {
            //     emitLwe()
            // }
            this.event = LWE.WORD_EVALUATED
        } else if (this.word.comp.dir === "f") {
            this.event = LWE.HINT_REQUESTED
        }
    }

    hint() {}

    arrange() {
        //
    }

    setButtons() {
        //
    }

    handleClick(button: string) {
        console.log(button)
        emitLwe(this.event, button)
    }
}
