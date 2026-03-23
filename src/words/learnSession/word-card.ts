import template from "./word-card.html?raw"
import type { CombinedWord, StyledText } from "../types"
import { getNext } from "./sessionData"
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
    // words: CombinedCard[]
    word: CombinedWord
    stage: "question" | "hint" | "answer"
    // variable = {
    //     writings: {
    //         question: [] as string[],
    //         answer: null as { main: StyledText; rare?: StyledText }
    //     },
    //     readings: {
    //         question: [] as string[],
    //         answer: {
    //             hira: { main: "" } as { main: string; rare?: string },
    //             kata: { main: "" } as { main: string; rare?: string }
    //         }
    //     }
    // }

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

    // updateCardContent() {
    //     // refactor this thing!
    //     console.log("content!")
    //     computeAll(this.word)
    //     const learn = this.word.comp.learn
    //     // if (!learn) return false
    //     const common = this.word.comp.common
    //     const card = this.word.card.data
    //     // console.log(learn, common, card)
    //     // this.refs.writings
    //     this.variable.writings.question = learn.writQuest
    //     this.variable.writings.answer = common.writings

    //     this.variable.readings.question = [
    //         ...card.readings.main,
    //         ...learn.readKata.question
    //     ]
    //     this.variable.readings.answer.hira = common.readings
    //     this.variable.readings.answer.kata = learn.readKata.answer

    //     return true
    // }

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
                // this.refs.readings.hide() // do we need readings in the end?
                if (this.word.comp.dir === "f") {
                    // const variants = this.variable.writings.question
                    const variants = comp.learn.writQuest
                    const q = variants[genRandomInt(variants.length)]
                    // console.log(variants, q)
                    // this.refs.writings.text(q).show()
                    this.refs.writMain.text(q).show()
                    this.refs.translation.hide()
                } else {
                    this.refs.writMain.hide()
                    this.refs.translation.html(card.translation).show()
                }
                break
            case "hint":
                // const variants = this.variable.readings.question
                const variants = [
                    ...card.readings.main,
                    ...comp.learn.readKata.question
                ]
                const q = variants[genRandomInt(variants.length)]
                // console.log(variants, q)
                this.refs.readMain.text(q).show()
                break
            case "answer":
                // const mw = this.variable.writings.answer.main
                const mw = comp.common.writings.main
                if (mw.isHtml) {
                    this.refs.writMain.html(mw.value).show()
                } else {
                    this.refs.writMain.text(mw.value).show()
                }

                const rw = comp.common.writings.rare
                if (rw) {
                    if (rw.isHtml) {
                        this.refs.writRare.html(rw.value).show()
                    } else {
                        this.refs.writRare.text(rw.value).show()
                    }
                }

                //  this.variable.readings.answer.hira = common.readings
                // this.variable.readings.answer.kata = learn.readKata.answer
                const hiraKata = [
                    comp.common.readings,
                    comp.learn.readKata.answer
                ]
                // const hk = ["hira", "kata"][genRandomInt(2)] as "hira" | "kata"
                const hki = genRandomInt(2)
                const mr = hiraKata[hki].main
                this.refs.readMain.text(mr).show()

                // const rr = this.variable.readings.answer[hk].rare
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
