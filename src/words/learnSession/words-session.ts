import template from "./word-session.html?raw"
import type { CombinedWord } from "../types";
import prepareSession, { getNext } from "./sessionData";
import { EVT, on } from "../../global/events";
import { computeAll } from "../parsers/readingsWritings";
import { LWE, onLwe } from "./events";

export default class WordsSession extends HTMLElement {
    // words: CombinedCard[]
    word: CombinedWord
    writings: HTMLDialogElement
    readings: HTMLDialogElement
    translation: HTMLDialogElement

    async connectedCallback() {
        // const session = await prepareSession()
        // this.word = await getNext()
        // console.log(this.word)
        getNext()
        this.innerHTML = template

        this.writings = this.querySelector(".writings")
        this.readings = this.querySelector(".readings")
        this.translation = this.querySelector(".translation")

        on(EVT.WORD_UPDATED, () => {
            this.updateCardView()
        })

        // this.updateCardView()
        onLwe(LWE.NEXT_WORD, (e) => this.ask(e))
    }

    ask(word: CombinedWord) {
        this.word = word
        this.updateCardView()
    }

    updateCardView() {
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