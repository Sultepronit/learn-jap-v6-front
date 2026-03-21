import template from "./word-buttons.html?raw"

import BaseComponent from "../../global/BaseComponent"
import type { CombinedWord } from "../types"
import { emitLwe, LWE, onLwe } from "./events"

type Mark = "good" | "pass" | "retry" | "bad"

type RefKeys = "pass"
export default class WordButtons extends BaseComponent<RefKeys> {
    word: CombinedWord
    expected: "hint" | "answer" | "evaluation"
    goodOrPass: Mark = "good"

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        onLwe(LWE.NEXT_WORD, this.setNext)

        this.addEventListener("click", e => {
            const t = e.target as HTMLButtonElement
            if (t.localName !== "button") return
            this.handleClick(t.name as Mark)
        })
    }

    setNext = (word: CombinedWord) => {
        this.word = word

        this.setButtons(["pass"])

        if (this.word.comp.auto) {
            this.expected = "evaluation"
        } else if (this.word.comp.dir === "f") {
            this.expected = "hint"
        } else {
            this.expected = "answer"
        }
    }

    setButtons(list: Mark[]) {
        for (const [name, ref] of Object.entries(this.refs)) {
            if (list.includes(name as Mark)) {
                ref.show()
            } else {
                ref.hide()
            }
        }
    }

    handleClick(mark: Mark) {
        console.log(mark, this.expected)
        // emitLwe(this.event, button)
        switch (this.expected) {
            case "hint":
                emitLwe(LWE.HINT_REQUESTED)
                this.expected = "answer"
                this.setButtons(["good", "bad"])
                break
            case "answer":
                emitLwe(LWE.ANSWER_REQUESTED)
                this.expected = "evaluation"

                const buttons: Mark[] = ["retry", "bad"]
                if (mark !== "bad") buttons.push(this.goodOrPass)
                this.setButtons(buttons)
                break
            case "evaluation":
                emitLwe(LWE.WORD_EVALUATED, mark)
                break
        }
    }
}
