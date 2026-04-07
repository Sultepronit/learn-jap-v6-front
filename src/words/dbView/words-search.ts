import template from "./words-search.html?raw"

import type { CombinedWord } from "../types"
import { EVT, on } from "../../global/events"

export default class WordsSearch extends HTMLElement {
    allData: CombinedWord[]
    displayData: CombinedWord[]

    wordNum: HTMLInputElement
    searchQuery: HTMLInputElement
    selectedWord: HTMLSpanElement
    listLength: HTMLSpanElement

    connectedCallback() {
        this.render()
        this.attachListeners()
    }

    render() {
        this.innerHTML = template

        this.wordNum = this.querySelector(".word-num")
        this.searchQuery = this.querySelector(".search-query")
        this.selectedWord = this.querySelector(".selected-word")
        this.listLength = this.querySelector(".list-length")
    }

    attachListeners() {
        on(EVT.WORDS_COUNT_CHANGED, async () => {
            this.wordNum.max = this.allData.length.toString()
        })

        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            const newVal = e.detail.cardNum.toString()
            // console.log(this.wordNum.value, newVal)
            if (this.wordNum.value === newVal) return

            this.wordNum.value = e.detail.cardNum
            // console.log(this.wordNum.value)
            this.updateSelected()
        })

        this.wordNum.addEventListener("input", () => {
            this.updateSelected()
            // this.parentElement.dispatchEvent(
            this.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: { cardNum: Number(this.wordNum.value), rowIdx: -1, navigate: true },
                    bubbles: true
                })
            )
        })

        this.searchQuery.addEventListener("input", () => {
            this.dispatchEvent(
                new CustomEvent("search", {
                    detail: { query: this.searchQuery.value },
                    bubbles: true
                })
            )
        })
    }

    setData(allData: CombinedWord[]) {
        this.allData = allData
        this.wordNum.max = this.allData.length.toString()
    }

    update(displayData: CombinedWord[]) {
        this.displayData = displayData
        this.listLength.textContent = displayData.length.toString()
        // console.log(displayData.length)

        this.updateSelected()
    }

    updateSelected() {
        const num = Number(this.wordNum.value)
        const idx = this.displayData.findIndex(w => w.num === num)
        // console.log(idx)
        const val = idx < 0 ? "-" : (idx + 1).toString()
        this.selectedWord.textContent = val
    }
}
