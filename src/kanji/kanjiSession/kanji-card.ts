import template from "./kanji-card.html?raw"

import { EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"
import type { CombinedKanji } from "../types"
import { genRandomInt } from "../../helpers/random"

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
            if (this.stage === "question") return
            this.updateCardView()
            this.updateStats()
        })

        // setInterval(() => this.shuffler([1, 2, 3]), 1000)
        // this.shuffler(null)
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
                this.refs.obsolete.hide()
                this.refs.readings.hide()
                this.refs.wordsList.hide()
                this.refs.font1.text(this.k.id)
                break
            case "answer":
                if (card.details?.obsolete) {
                    this.refs.obsolete.text(card.details.obsolete).show()
                }
                if (card.readings) {
                    this.refs.readings.text(card.readings).show()
                }
                if (comp.words) {
                    // const mw = this.
                    const blocks = this.shuffler(comp.words.main || [])
                    if (comp.words.other) {
                        blocks.push(`<hr>`, ...this.shuffler(comp.words.other))
                    }
                    this.refs.wordsList.html(blocks.join("")).show()
                }
                break
        }
    }

    shuffler(input: any[]) {
        if (input?.length < 2) return input
        const ri = genRandomInt(input.length)
        console.log(ri)
        if (ri === 0) return input
        const a = input.slice(0, ri)
        const b = input.slice(ri)
        console.log(a, b)
        console.log([...b, ...a])
        return [...b, ...a]
    }
}
