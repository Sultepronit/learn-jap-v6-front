import { EVT, emit } from "../../global/events"
import type { CombinedCard } from "../types"
import template from "./word-editor.html?raw"

export default class WordEditor extends HTMLElement {
    private data: CombinedCard[]
    private word: CombinedCard
    private wordV = 0
    private status: HTMLInputElement
    private writings: HTMLInputElement
    private altWrit: HTMLButtonElement
    private readings: HTMLInputElement
    private translation: HTMLInputElement

    render() {
        this.innerHTML = template
        this.status = this.querySelector('[name="status"]')
        this.writings = this.querySelector('[name="writings"]')
        this.altWrit = this.querySelector('[name="toggle-alt"]')
        this.readings = this.querySelector('[name="readings"]')
        this.translation = this.querySelector('[name="translation"]')
    }

    implementMutation(part: "card" | "prog") {
        this.word.v++ // to update views of the word
        this.wordV = this.word.v // not to update it here!
        emit(EVT.WORD_UPDATED) // for the views
        emit(EVT.CARD_MUTATED, { // for the DBs
            type: part === "card" ? "wordCards" : "wordProgs",
            card: this.word[part]
        })
        // const { num, id } = this.word
        // emit(MSG.WORD_CARD_MUTATED, { num, id })
        // if (part === "card") {
        //     emit(MSG.WORD_CARD_MUTATED, this.word[part])
        // }
    }

    connectedCallback() {
        this.render()

        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            // console.log(e)
            const { cardNum } = e.detail
            // console.log(cardNum)
            // console.log(this.data[cardNum - 1])
            this.word = this.data[cardNum - 1];
            console.log(this.word)
            this.wordV = this.word.v
            this.updateEditorContent()
        })

        document.addEventListener("word-updated", () => {
            if (this.wordV !== this.word.v) this.updateEditorContent()
        })

        this.status.addEventListener("change", () => {
            console.log(this.status.value)
            this.word.prog.data.status = Number(this.status.value)
            this.implementMutation("prog")
        })

        this.altWrit.addEventListener("click", () => {
            if (this.word.card.data.writings.alt) {
                delete this.word.card.data.writings.alt
            } else {
                this.word.card.data.writings.alt = true
            }
            this.altWrit.classList.toggle("is-alt")
            this.writings.classList.toggle("blue")
            this.implementMutation("card")
        })

        this.translation.addEventListener("change", () => {
            this.word.card.data.translation = this.translation.value
            this.implementMutation("card")
        })
    }

    setData(data: CombinedCard[]) {
        this.data = data
    }

    updateEditorContent() {
        // console.log("editor update!")
        const prog = this.word.prog?.data;
        this.status.value = prog?.status.toString()
        this.writings.value = this.word.card?.data.writings.main.join(", ")
        if (this.word.card?.data.writings.alt) {
            this.writings.classList.add("blue")
            this.altWrit.classList.add("is-alt")
        } else {
            this.writings.classList.remove("blue")
            this.altWrit.classList.remove("is-alt")
        }
        this.readings.value = this.word.card?.data.readings.main.join(", ")
        this.translation.value = this.word.card?.data.translation
    }
}