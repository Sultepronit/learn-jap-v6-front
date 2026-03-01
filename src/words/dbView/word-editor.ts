import { EVENT, emit } from "../../global/events"
import type { CombinedCard } from "../types"
import template from "./word-editor.html?raw"

export default class WordEditor extends HTMLElement {
    private data: CombinedCard[]
    private card: CombinedCard
    private cardV = 0
    private writings: HTMLInputElement
    private altWrit: HTMLButtonElement
    private readings: HTMLInputElement
    private translation: HTMLInputElement

    render() {
        this.innerHTML = template
        this.writings = this.querySelector('[name="writings"]')
        this.altWrit = this.querySelector('[name="toggle-alt"]')
        this.readings = this.querySelector('[name="readings"]')
        this.translation = this.querySelector('[name="translation"]')
    }

    connectedCallback() {
        this.render()

        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            // console.log(e)
            const { cardNum } = e.detail
            // console.log(cardNum)
            // console.log(this.data[cardNum - 1])
            this.card = this.data[cardNum - 1];
            this.cardV = this.card.v
            this.updateEditorContent()
        })

        document.addEventListener("word-updated", () => {
            if (this.cardV !== this.card.v) this.updateEditorContent()
        })

        this.altWrit.addEventListener("click", () => {
            this.card.card.altWriting = !this.card.card.altWriting
            this.altWrit.classList.toggle("is-alt")
            this.writings.classList.toggle("blue")

            this.card.v++
            this.cardV = this.card.v
            // document.dispatchEvent(new Event(EVENT.WORD_UPDATED))
            emit(EVENT.WORD_UPDATED)
        })

        this.translation.addEventListener("change", (e) => {
            // console.log(e)
            this.card.card.translation = this.translation.value

            this.card.v++
            this.cardV = this.card.v
            // document.dispatchEvent(new Event("word-updated"))
            emit(EVENT.WORD_UPDATED)
        })
    }

    setData(data: CombinedCard[]) {
        this.data = data
    }

    updateEditorContent() {
        console.log("editor update!")
        this.writings.value = this.card.card?.writings.join(", ")
        if (this.card.card?.altWriting) {
            this.writings.classList.add("blue")
            this.altWrit.classList.add("is-alt")
        } else {
            this.writings.classList.remove("blue")
            this.altWrit.classList.remove("is-alt")
        }
        this.readings.value = this.card.card?.readings.join(", ")
        this.translation.value = this.card.card?.translation
    }
}