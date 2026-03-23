import template from "./word-card.html?raw"
import type { CombinedWord } from "../types"
import { EVT, on } from "../../global/events"
import { computeAll } from "../parsers/readingsWritings"
import BaseComponent from "../../global/BaseComponent"
import { genRandomInt } from "../../helpers/random"

type RefKeys =
    | "stats"
    | "writMain"
    | "writRare"
    | "readMain"
    | "readRare"
    | "translation"
    | "example"

export default class WordCard extends BaseComponent<RefKeys> {
    word: CombinedWord
    stage: "question" | "hint" | "answer"

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.WS.NEXT_CARD, w => this.ask(w))
        on(EVT.WS.HINT_REQUESTED, () => this.hint())
        on(EVT.WS.ANSWER_REQUESTED, () => this.answer())

        on(EVT.WS.WORD_UPDATED, () => this.updateCardView())
    }

    updateStats() {
        const p = this.word.prog.data
        this.refs.stats
            .text(
                `
                ${this.word.num} [${p.status}] ${p.f.progress} ${p.b.progress}
                | ${p.f.record}${p.f.autorepeat ? "*" : ""}
                ${p.b.record}${p.b.autorepeat ? "*" : ""}
                `
            )
            .replaceClasses(["stats", this.word.comp.stage])
    }

    ask(word: CombinedWord) {
        console.log(word)
        this.word = word
        this.stage =
            this.word.comp.stage === "autorepeat" ? "answer" : "question"
        this.updateStats()
        this.updateCardView()
    }

    hint() {
        this.stage = "hint"
        this.updateCardView()
    }

    answer() {
        this.stage = "answer"
        this.updateCardView()
    }

    updateCardView() {
        if (!this.word.card) return
        computeAll(this.word)
        // console.timeLog("t1", "card view!")

        const card = this.word.card.data
        const comp = this.word.comp

        this.refs.writRare.hide()
        this.refs.readMain.hide()
        this.refs.readRare.hide()
        this.refs.example.hide()

        switch (this.stage) {
            case "question":
                if (this.word.comp.dir === "f") {
                    const variants = comp.learn.writQuest
                    const q = variants[genRandomInt(variants.length)]
                    // console.log(variants, q)
                    this.refs.writMain.text(q).show()
                    this.refs.translation.hide()
                } else {
                    this.refs.writMain.hide()
                    this.refs.translation.html(card.translation).show()
                }
                break
            case "hint":
                const variants = [
                    ...card.readings.main,
                    ...comp.learn.readKata.question
                ]
                const q = variants[genRandomInt(variants.length)]
                // console.log(variants, q)
                this.refs.readMain.text(q).show()
                break
            case "answer":
                const mw = comp.common.writings.main
                this.refs.writMain.text(mw.value, mw.isHtml).show()
                // if (mw.isHtml) {
                //     this.refs.writMain.html(mw.value).show()
                // } else {
                //     this.refs.writMain.text(mw.value).show()
                // }

                const rw = comp.common.writings.rare
                if (rw) {
                    this.refs.writRare.text(rw.value, rw.isHtml).show()
                    // if (rw.isHtml) {
                    //     this.refs.writRare.html(rw.value).show()
                    // } else {
                    //     this.refs.writRare.text(rw.value).show()
                    // }
                }

                const hiraKata = [
                    comp.common.readings,
                    comp.learn.readKata.answer
                ]
                const hki = genRandomInt(2)
                const mr = hiraKata[hki].main
                this.refs.readMain.text(mr).show()

                const rr = hiraKata[hki].rare
                if (rr) {
                    this.refs.readRare.text(rr).show()
                } else {
                    this.refs.readRare.hide()
                }

                this.refs.translation.html(card.translation).show()

                this.refs.example.html(card.example).show()
                break
        }
    }
}
