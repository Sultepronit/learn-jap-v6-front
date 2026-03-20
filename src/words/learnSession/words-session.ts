import template from "./word-session.html?raw"
import type { CombinedWord } from "../types"
import { getNext } from "./sessionData"
import { EVT, on } from "../../global/events"
import { computeAll } from "../parsers/readingsWritings"
import { LWE, onLwe } from "./events"
import BaseComponent from "../../global/BaseComponent"

type RefKeys =
    | "writings"
    | "readings"
    | "readMain"
    | "readRare"
    | "translation"
    | "example"
export default class WordsSession extends BaseComponent<RefKeys> {
    // words: CombinedCard[]
    word: CombinedWord
    writings: HTMLDialogElement
    readings: HTMLDialogElement
    translation: HTMLDialogElement
    stage: "question" | "hint" | "answer"
    changable = {
        writings: {
            question: [] as string[],
            answer: { main: "", rare: "" }
        },
        readings: {
            question: {
                hira: [] as string[],
                kata: [] as string[]
            },
            answer: {
                hira: { main: "", rare: "" },
                kata: { main: "", rare: "" } as { main: string; rare?: string }
            }
        }
    }

    async connectedCallback() {
        // const session = await prepareSession()
        // this.word = await getNext()
        // console.log(this.word)
        const initPromise = getNext()
        this.innerHTML = template

        this.collectRefs()
        console.log(this.refs)

        this.writings = this.querySelector(".writings")
        this.readings = this.querySelector(".readings")
        this.translation = this.querySelector(".translation")

        onLwe(LWE.NEXT_WORD, e => this.ask(e))

        await initPromise
        on(EVT.WORD_UPDATED, () => {
            // check the v?
            // this.updateCardView()
            this.updateCardContent()
        })

        // this.updateCardView()
    }

    ask(word: CombinedWord) {
        this.word = word
        this.stage = "question"
        // this.updateCardView()
        this.updateCardContent()
        this.updateCardView()
    }

    updateCardContent() {
        computeAll(this.word)
        const learn = this.word.comp.learn
        if (!learn) return
        const common = this.word.comp.common
        const card = this.word.card.data
        console.log(learn, common, card)
        // this.refs.writings
        this.changable.readings.question.hira = card.readings.main
        this.changable.readings.question.kata = learn.readKata.question
        this.changable.readings.answer.hira.main = common.readings.main
        this.changable.readings.answer.hira.rare = common.readings.rare
        this.changable.readings.answer.kata = learn.readKata.answer
        // this.refs.readMain.text(this.changable.readings.answer.kata.main)
        // this.refs.readRare.text(this.changable.readings.answer.kata.rare)
        this.refs.translation.html(card.translation)
        this.refs.example.html(card.example)
    }

    updateCardView() {
        console.timeLog("t1", "card view!")
        switch (this.stage) {
            case "question":
                this.refs.readings.hide()
                if (this.word.comp.dir === "f") {
                    this.refs.writings.text("Question!").show()
                    this.refs.translation.hide()
                } else {
                    this.refs.writings.hide()
                    this.refs.translation.show()
                }
                break
            case "hint":
            case "answer":
        }
    }

    updateCardView0() {
        computeAll(this.word)
        // console.log("editor update!")
        const card = this.word.card?.data
        const prog = this.word.prog?.data
        // this.status.value = prog?.status.toString()
        this.writings.innerHTML = card?.writings.main.join(" ")
        if (card?.writings.alt) {
            this.writings.classList.add("blue")
        } else {
            this.writings.classList.remove("blue")
        }
        this.readings.textContent = card?.readings.main.join(" ")
        this.translation.innerHTML = card?.translation
    }
}
