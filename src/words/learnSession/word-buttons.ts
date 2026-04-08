import template from "./word-buttons.html?raw"

import BaseComponent from "../../global/BaseComponent"
import type { CombinedWord } from "../types"
import { emit, EVT, on } from "../../global/events"
import type { Mark } from "../../global/types"

export default class WordButtons extends BaseComponent<Mark> {
    word: CombinedWord
    expected: "hint" | "answer" | "evaluation"
    retryWidth = "6"

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.WS.NEXT_CARD, w => this.setNext(w))

        this.addEventListener("click", e => {
            const t = e.target as HTMLButtonElement
            if (t.localName !== "button") return
            this.handleClick(t.name as Mark)
        })
    }

    setNext(word: CombinedWord) {
        this.word = word

        let button: Mark = "pass"

        if (this.word.comp.stage === "autorepeat") {
            this.expected = "evaluation"
            button = "good"
        } else if (this.word.comp.dir === "f") {
            this.expected = "hint"
        } else {
            this.expected = "answer"
        }

        this.setButtons([button])
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
        switch (this.expected) {
            case "hint":
                emit(EVT.WS.HINT_REQUESTED)
                this.expected = "answer"

                if (this.retryWidth !== "6") {
                    this.retryWidth = "6"
                    this.refs.retry.el.style.flexGrow = "6"
                    this.refs.bad.el.style.flexGrow = "6"
                }

                this.setButtons(["good", "bad"])
                break
            case "answer":
                emit(EVT.WS.ANSWER_REQUESTED)
                this.expected = "evaluation"

                let progress = this.word.prog.data[this.word.comp.dir].progress
                if (this.word.comp.stage === "learn") progress /= 2
                let widthNum = 6 + progress
                if (widthNum < 2) widthNum = 2
                const newWidth = widthNum.toString()
                if (this.retryWidth !== newWidth) {
                    this.retryWidth = newWidth
                    this.refs.retry.el.style.flexGrow = newWidth
                    this.refs.bad.el.style.flexGrow = (12 - widthNum).toString()
                }

                const buttons: Mark[] = ["retry", "bad"]
                if (
                    mark !== "bad" ||
                    this.word.card.data.writings.alt ||
                    this.word.card.data.readings.main.length > 1
                ) {
                    buttons.push(this.word.comp.retrying ? "pass" : "good")
                }
                this.setButtons(buttons)
                break
            case "evaluation":
                emit(EVT.WS.EVALUATED, mark)
                break
        }
    }
}
