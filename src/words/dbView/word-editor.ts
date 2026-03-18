import template from "./word-editor.html?raw"

import { EVT, emit } from "../../global/events"
import { addNew } from "../data/data"
import type { CombinedCard } from "../types"

export default class WordEditor extends HTMLElement {
    data: CombinedCard[]
    word: CombinedCard
    wordV = 0
    delete: HTMLButtonElement
    status: HTMLInputElement
    writings: HTMLInputElement
    altWrit: HTMLButtonElement
    readings: HTMLInputElement
    translation: HTMLInputElement

    render() {
        this.innerHTML = template
        this.delete = this.querySelector('.delete-word')
        this.status = this.querySelector('[name="status"]')
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
            this.word = this.data[cardNum - 1];
            console.log(this.word)
            this.wordV = this.word.v
            this.updateEditorContent()
        })

        document.addEventListener("word-updated", () => {
            if (this.wordV !== this.word.v) this.updateEditorContent()
        })

        this.delete.addEventListener("click", () => {
            console.log("remove ", this.word.id)
            this.deleteWord(this.word.id)
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

    addNew() {
        const id = Date.now()
        this.word.id = id
        this.word.card.id = id
        this.word.prog.id = id

        addNew(this.word)

        emit(EVT.WORD_UPDATED) 
        emit(EVT.CARD_MUTATED, { type: "wordCards", card: this.word.card })
        emit(EVT.CARD_MUTATED, { type: "wordProgs", card: this.word.prog })
    }

    implementMutation(part: "card" | "prog") {
        this.word.v++ // to update views of the word
        this.wordV = this.word.v // not to update it here!
        
        if (this.word.id === Infinity) return this.addNew()

        emit(EVT.WORD_UPDATED) // for the views
        emit(EVT.CARD_MUTATED, { // for the DBs
            type: part === "card" ? "wordCards" : "wordProgs",
            card: this.word[part]
        })
    }

    deleteWord(id: number) {
        emit(EVT.WORD_DELETE_INIT, id)
        emit(EVT.WORDS_DELETED, [id])
    }
}