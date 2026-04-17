import template from "./kanji-card.html?raw"

import { EVT, on } from "../../global/events"
import BaseComponent from "../../global/BaseComponent"
import type { CombinedKanji } from "../types"
import { genRandomInt } from "../../helpers/random"

type RefKeys = "stats" | "font1" | "obsolete" | "readings" | "wordsList"

export default class KanjiCard extends BaseComponent<RefKeys> {
    k: CombinedKanji
    kV = 0
    cV = 0
    pV = 0

    stage: "question" | "answer"

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.KS.NEXT_CARD, k => {
            this.k = k
            this.kV = k.v
            this.cV = k.card.v
            this.pV = k.prog.v
            this.ask(k)
        })

        on(EVT.KS.ANSWER_REQUESTED, () => this.answer())

        on(EVT.KANJI_UPDATED, () => {
            if (!this.k || this.k.v === this.kV) return
            // if (this.stage === "question") return
            if (this.cV !== this.k.card.v) this.updateCardView()
            if (this.pV !== this.k.prog.v) this.updateStats()
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
            .replaceClasses(["stats", "card-stats", this.k.comp.stage])
    }

    ask(k: CombinedKanji) {
        this.k = k
        this.stage = "question"
        this.refs.stats.hide(true)
        this.updateCardView()
    }

    answer() {
        this.stage = "answer"
        this.updateStats()
        this.refs.stats.show(true)
        this.updateCardView()
    }

    updateCardView() {
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

                const blocks = this.shuffler(comp.words.main || [])
                if (comp.words.other) {
                    blocks.push(`<hr>`, ...this.shuffler(comp.words.other))
                }
                if (blocks.length > 0) {
                    this.refs.wordsList.html(blocks.join("")).show()
                }
                break
        }
    }

    shuffler(input: any[]) {
        if (input?.length < 2) return input
        const ri = genRandomInt(input.length)
        if (ri === 0) return input
        const a = input.slice(0, ri)
        const b = input.slice(ri)
        return [...b, ...a]
    }
}
