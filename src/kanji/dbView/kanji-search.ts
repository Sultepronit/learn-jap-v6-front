import template from "./kanji-search.html?raw"

import BaseComponent from "../../global/BaseComponent"
import type { CombinedKanji } from "../types"

type TKeys = "kanjiNum" | "searchQuery" | "selectedKanji" | "listLength"
export default class KanjiSearch extends BaseComponent<TKeys> {
    allData: CombinedKanji[]
    displayData: CombinedKanji[]

    connectedCallback() {
        this.render()
        this.collectRefs()
        // console.log(this.refs)
        this.attachListeners()
    }

    render() {
        this.innerHTML = template
    }

    attachListeners() {
        // remove?
        // on(EVT.KANJI_COUNT_CHANGED, async () => {
        //     this.wordNum.max = this.allData.length.toString()
        // })

        // this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
        this.closest("kanji-db").addEventListener("card-selected", (e: CustomEvent) => {
            const newVal = e.detail.cardNum.toString()
            // console.log(this.refs.kanjiNum.value, newVal)
            if (this.refs.kanjiNum.value === newVal) return

            this.refs.kanjiNum.value = e.detail.cardNum

            this.updateSelected()
        })

        this.refs.kanjiNum.on("input", () => {
            this.updateSelected()

            this.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: {
                        cardNum: Number(this.refs.kanjiNum.value),
                        rowIdx: -1,
                        navigate: true
                    },
                    bubbles: true
                })
            )
        })

        this.refs.searchQuery.on("input", () => {
            this.dispatchEvent(
                new CustomEvent("search", {
                    detail: { query: this.refs.searchQuery.value },
                    bubbles: true
                })
            )
        })
    }

    setData(allData: CombinedKanji[]) {
        this.allData = allData
        this.refs.kanjiNum.elAsInput.max = this.allData.length.toString()
    }

    update(displayData: CombinedKanji[]) {
        this.displayData = displayData
        this.refs.listLength.text(displayData.length)
        // console.log(displayData.length)

        this.updateSelected()
    }

    updateSelected() {
        const num = Number(this.refs.kanjiNum.value)
        // console.log(this.displayData)
        const idx = this.displayData.findIndex(w => w.num === num)
        // console.log(idx)
        const val = idx < 0 ? "-" : idx + 1
        this.refs.selectedKanji.text(val)
        console.log(this.displayData[idx])
    }
}
