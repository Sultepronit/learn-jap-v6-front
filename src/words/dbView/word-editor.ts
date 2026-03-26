import template from "./word-editor.html?raw"

import { EVT, emit, on } from "../../global/events"
import { addNew } from "../data/data"
import type { CombinedWord, WordCard, WordProg } from "../types"
import BaseComponent from "../../global/BaseComponent"

type RefKeys =
    | "delete"
    | "status"
    | "mainWrit"
    | "rareWrit"
    | "toggleAlt"
    | "mainRead"
    | "rareRead"
    | "translation"
    | "example"
export default class WordEditor extends BaseComponent<RefKeys> {
    data: CombinedWord[]
    word: CombinedWord
    card: WordCard["data"]
    prog: WordProg["data"]
    wordV = 0

    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        this.setControls()

        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            const { cardNum } = e.detail
            this.word = this.data[cardNum - 1]
            console.log(this.word)
            this.wordV = this.word.v
            this.updateEditorContent()
        })

        on(EVT.WORD_UPDATED, () => {
            if (this.wordV !== this.word.v) this.updateEditorContent()
        })
    }

    setData(data: CombinedWord[]) {
        this.data = data
    }

    updateArray(
        from: string,
        to: WordCard["data"]["writings"] | WordCard["data"]["readings"],
        variant: "main" | "rare"
    ) {
        to[variant] = from.split(",").map(e => e.trim())

        if (variant === "rare" && to.rare.length < 1) delete to.rare

        this.implementMutation("card")
    }

    setControls() {
        this.refs.delete.on("click", () => this.deleteWord(this.word.id))

        this.refs.status.on("change", () => {
            this.word.prog.data.status = Number(this.refs.status.value)
            this.implementMutation("prog")
        })

        this.refs.mainWrit.on("change", () =>
            this.updateArray(this.refs.mainWrit.value, this.card.writings, "main")
        )

        this.refs.rareWrit.on("change", () =>
            this.updateArray(this.refs.rareWrit.value, this.card.writings, "rare")
        )

        this.refs.toggleAlt.on("click", () => {
            if (this.word.card.data.writings.alt) {
                delete this.word.card.data.writings.alt
            } else {
                this.word.card.data.writings.alt = true
            }
            this.refs.toggleAlt.toggleClass("is-alt")
            this.refs.mainWrit.toggleClass("alt")
            this.implementMutation("card")
        })

        this.refs.mainRead.on("change", () =>
            this.updateArray(this.refs.mainRead.value, this.card.readings, "main")
        )

        this.refs.rareRead.on("change", () =>
            this.updateArray(this.refs.rareRead.value, this.card.readings, "rare")
        )

        this.refs.translation.on("change", () => {
            this.word.card.data.translation = this.refs.translation.value
            this.implementMutation("card")
        })

        this.refs.example.on("change", () => {
            this.word.card.data.example = this.refs.example.value
            if (!this.word.card.data.example) delete this.word.card.data.example
            this.implementMutation("card")
        })
    }

    updateEditorContent() {
        this.card = this.word.card?.data
        this.prog = this.word.prog?.data
        // const prog = this.word.prog?.data
        if (!this.card || !this.prog) return

        this.refs.status.value = this.prog?.status
        this.refs.mainWrit.value = this.word.card?.data.writings.main.join(", ")
        if (this.word.card?.data.writings.alt) {
            this.refs.mainWrit.addClass("alt")
            this.refs.toggleAlt.addClass("is-alt")
        } else {
            this.refs.mainWrit.removeClass("alt")
            this.refs.toggleAlt.removeClass("is-alt")
        }
        this.refs.rareWrit.value = (this.word.card?.data.writings.rare || []).join(", ")

        this.refs.mainRead.value = this.word.card?.data.readings.main.join(", ")
        this.refs.rareRead.value = (this.word.card?.data.readings.rare || []).join(", ")

        this.refs.translation.value = this.word.card?.data.translation

        this.refs.example.value = this.word.card?.data.example || ""
    }

    implementMutation(part: "card" | "prog") {
        this.word.v++ // to update views of the word
        this.wordV = this.word.v // to not update it here!

        if (this.word.id === Infinity) return this.addNew()

        emit(EVT.CARD_MUTATED, {
            type: part === "card" ? "wordCards" : "wordProgs",
            card: this.word[part]
        })
        emit(EVT.WORD_UPDATED)
    }

    addNew() {
        const id = Date.now()
        this.word.id = id
        this.word.card.id = id
        this.word.prog.id = id

        addNew(this.word)

        emit(EVT.CARD_MUTATED, { type: "wordCards", card: this.word.card })
        emit(EVT.CARD_MUTATED, { type: "wordProgs", card: this.word.prog })
        emit(EVT.WORD_UPDATED)
    }

    deleteWord(id: number) {
        if (!confirm("Do delete?")) return

        console.log("remove ", this.word.id)
        emit(EVT.WORD_DELETE_INIT, id)
        emit(EVT.WORDS_DELETED, [id])
    }
}
