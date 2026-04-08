import template from "./kanji-card.html?raw"

import { EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"
import { genRandomInt } from "../../helpers/random"
import type { CombinedKanji } from "../types"

type RefKeys = "stats" | "font1" | "obsolete" | "readings" | "wordsList"

export default class KanjiCard extends BaseComponent<RefKeys> {
    k: CombinedKanji
    kV = 0

    stage: "question" | "answer"

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.KS.NEXT_CARD, k => {
            this.k = k
            this.kV = k.v
            this.ask(k)
        })

        on(EVT.KS.ANSWER_REQUESTED, () => this.answer())

        on(EVT.KANJI_UPDATED, () => {
            if (!this.k || this.k.v === this.kV) return
            this.updateCardView()
            this.updateStats()
        })
    }

    updateStats() {
        const p = this.k.prog?.data
        if (!p) return
        this.refs.stats
            .text(
                `
                ${this.k.card.data.created}
                [${p.status.toLocaleString("uk")}] ${p.progress} ${p.record}
                `
            )
            .replaceClasses(["stats", this.k.comp.stage])
    }

    ask(k: CombinedKanji) {
        this.k = k
        this.stage = "question"
        // this.updateStats()
        this.refs.stats.hide()
        this.updateCardView()
    }

    answer() {
        this.stage = "answer"
        this.updateStats()
        this.refs.stats.show()
        this.updateCardView()
    }

    updateCardView() {
        if (!this.k.card) return
        // computeAll(this.k)
        // console.timeLog("t1", "card view!")

        const card = this.k.card.data
        const comp = this.k.comp

        switch (this.stage) {
            case "question":
                this.refs.font1.text(this.k.id)
                this.refs.obsolete.hide()
                this.refs.readings.hide()
                this.refs.wordsList.hide()
                break
            case "answer":
                if (card.details?.obsolete) {
                    this.refs.obsolete.text(card.details.obsolete).show()
                }
                if (card.readings) {
                    this.refs.readings.text(card.readings).show()
                }
                break
        }
    }
}
