import template from "./words-search.html?raw"

import type { CombinedCard } from "../types"

export default class WordsSearch extends HTMLElement {
    allData: CombinedCard[]
    displayData: CombinedCard[]

    wordNum: HTMLInputElement
    searchQuery: HTMLInputElement

    connectedCallback() {
        this.render()
        this.attachListeners()
    }

    render() {
        this.innerHTML = template

        this.wordNum = this.querySelector(".word-num")
        this.searchQuery = this.querySelector(".search-query")
    }

    attachListeners() {
        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            const newVal = e.detail.cardNum.toString()
            // console.log(this.wordNum.value, newVal)
            if (this.wordNum.value === newVal) return;

            this.wordNum.value = e.detail.cardNum
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
        console.log(this.allData.length)
        this.wordNum.max = this.allData.length.toString()
    }
}