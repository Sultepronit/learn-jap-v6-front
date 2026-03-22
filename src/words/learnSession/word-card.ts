import template from "./word-card.html?raw"
import type { CombinedWord, StyledText } from "../types"
import { getNext } from "./sessionData"
import { EVT, on } from "../../global/events"
import { computeAll } from "../parsers/readingsWritings"
import BaseComponent from "../../global/BaseComponent"
import { genRandomInt } from "../../helpers/random"

type RefKeys =
    | "stats"
    | "writings"
    | "readings"
    | "readMain"
    | "readRare"
    | "translation"
    | "example"

export default class WordCard extends BaseComponent<RefKeys> {
    // words: CombinedCard[]
    word: CombinedWord
    stage: "question" | "hint" | "answer"
    variable = {
        writings: {
            question: [] as string[],
            answer: null as { main: StyledText; rare?: StyledText }
        },
        readings: {
            question: [] as string[],
            answer: {
                hira: { main: "" } as { main: string; rare?: string },
                kata: { main: "" } as { main: string; rare?: string }
            }
        }
    }

    async connectedCallback() {
        this.innerHTML = template

        this.collectRefs()
        // console.log(this.refs)

        // onLwe(LWE.NEXT_WORD, e => this.ask(e))
        // onLwe(LWE.HINT_REQUESTED, () => this.hint())
        // onLwe(LWE.ANSWER_REQUESTED, () => this.answer())
        on(EVT.WS.NEXT_CARD, w => this.ask(w))
        on(EVT.WS.HINT_REQUESTED, () => this.hint())
        on(EVT.WS.ANSWER_REQUESTED, () => this.answer())

        // onLwe(LWE.WORD_UPDATED, () => this.updateCardView())
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

    updateCardContent() {
        // refactor this thing!
        console.log("content!")
        computeAll(this.word)
        const learn = this.word.comp.learn
        // if (!learn) return false
        const common = this.word.comp.common
        const card = this.word.card.data
        // console.log(learn, common, card)
        // this.refs.writings
        this.variable.writings.question = learn.writQuest
        this.variable.writings.answer = common.writings

        this.variable.readings.question = [
            ...card.readings.main,
            ...learn.readKata.question
        ]
        this.variable.readings.answer.hira = common.readings
        this.variable.readings.answer.kata = learn.readKata.answer

        return true
    }

    updateCardView() {
        if (!this.word.card) return
        if (!this.updateCardContent()) return
        // console.timeLog("t1", "card view!")

        const card = this.word.card.data
        switch (this.stage) {
            case "question":
                // this.refs.readings.hide() // do we need readings in the end?
                this.refs.readMain.hide()
                this.refs.readRare.hide()
                this.refs.example.hide()
                if (this.word.comp.dir === "f") {
                    const variants = this.variable.writings.question
                    const q = variants[genRandomInt(variants.length)]
                    console.log(variants, q)
                    this.refs.writings.text(q).show()
                    this.refs.translation.hide()
                } else {
                    this.refs.writings.hide()
                    this.refs.translation.html(card.translation).show()
                }
                break
            case "hint":
                const variants = this.variable.readings.question
                const q = variants[genRandomInt(variants.length)]
                console.log(variants, q)
                this.refs.readMain.text(q).show()
                break
            case "answer":
                const mw = this.variable.writings.answer.main
                if (mw.isHtml) {
                    this.refs.writings.html(mw.value).show()
                } else {
                    this.refs.writings.text(mw.value).show()
                }

                const hk = ["hira", "kata"][genRandomInt(2)] as "hira" | "kata"
                const mr = this.variable.readings.answer[hk].main
                this.refs.readMain.text(mr).show()
                const rr = this.variable.readings.answer[hk].rare
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
