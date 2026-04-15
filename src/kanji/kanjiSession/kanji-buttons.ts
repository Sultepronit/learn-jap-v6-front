import template from "../../views/learnSession/nav-buttons.html?raw"

import BaseComponent from "../../global/BaseComponent"
import { emit, EVT, on } from "../../global/events"
import type { Mark } from "../../global/types"
import type { CombinedKanji } from "../types"

export default class KanjiButtons extends BaseComponent<Mark> {
    k: CombinedKanji
    expected: "answer" | "evaluation"
    retryWidth = "6"

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.KS.NEXT_CARD, k => this.setNext(k))

        this.addEventListener("click", e => {
            const t = e.target as HTMLButtonElement
            if (t.localName !== "button") return
            this.handleClick(t.name as Mark)
        })
    }

    setNext(k: CombinedKanji) {
        this.k = k
        this.expected = "answer"
        this.setButtons(["pass"])
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
            case "answer":
                emit(EVT.KS.ANSWER_REQUESTED)
                this.expected = "evaluation"

                let progress = this.k.prog.data.progress
                if (this.k.comp.stage === "learn") progress /= 2
                let widthNum = 6 + progress
                if (widthNum < 2) widthNum = 2
                const newWidth = widthNum.toString()
                if (this.retryWidth !== newWidth) {
                    this.retryWidth = newWidth
                    this.refs.retry.el.style.flexGrow = newWidth
                    this.refs.bad.el.style.flexGrow = (12 - widthNum).toString()
                }

                this.setButtons([this.k.comp.retrying ? "pass" : "good", "retry", "bad"])
                break
            case "evaluation":
                emit(EVT.KS.EVALUATED, mark)
                break
        }
    }
}
