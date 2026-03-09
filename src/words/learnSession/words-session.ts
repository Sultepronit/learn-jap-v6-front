import template from "./word-session.html?raw"
import type { CombinedCard } from "../types";
import prepareSession from "./sessionData";
import { EVT, on } from "../../global/events";

export default class WordsSession extends HTMLElement {
    // words: CombinedCard[]
    word: CombinedCard
    writings: HTMLDialogElement
    readings: HTMLDialogElement
    translation: HTMLDialogElement

    async connectedCallback() {
        const session = await prepareSession()
        this.word = session[0]
        console.log(session[0])
        this.innerHTML = template

        this.writings = this.querySelector(".writings")
        this.readings = this.querySelector(".readings")
        this.translation = this.querySelector(".translation")

        on(EVT.WORD_UPDATED, () => {
            this.updateCardView()
        })

        this.updateCardView()
    }

    updateCardView() {
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