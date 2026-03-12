import template from "./words-search.html?raw"

import type { CombinedCard } from "../types"

export default class WordsSearch extends HTMLElement {
    allData: CombinedCard[]
    displayData: CombinedCard[]

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
        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            const newVal = e.detail.cardNum.toString()
            // console.log(this.wordNum.value, newVal)
            if (this.wordNum.value === newVal) return;

            this.wordNum.value = e.detail.cardNum
            // console.log(this.wordNum.value)
            this.updateSelected()
        })

        this.wordNum.addEventListener("input", () => {
            this.parentElement.dispatchEvent(new CustomEvent(
                "card-selected",
                { detail: { cardNum: Number(this.wordNum.value), rowIdx: -1 } }
            ))
        })

        this.searchQuery.addEventListener("input", () => {
            this.dispatchEvent(new CustomEvent(
                "search",
                { detail: { query: this.searchQuery.value } }
            ))
        })
    }

    setData(allData: CombinedCard[]) {
        this.allData = allData
        this.wordNum.max = this.allData.length.toString()
    }

    update(displayData: CombinedCard[]) {
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
        this.selectedWord.textContent = val;
    }
}