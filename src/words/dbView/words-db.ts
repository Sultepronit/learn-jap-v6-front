import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadBasicList } from "../data/data"
import type { CombinedWord } from "../types"
import type WordEditor from "./word-editor"
import type WordsSearch from "./words-search"
import { searchSort, sort } from "./sortSearch"
import { EVT, on } from "../../global/events"
import fillRow from "./fillBTRow"

export default class WordsDb extends HTMLElement {
    allData: CombinedWord[]
    displayData: CombinedWord[]

    searchBar: WordsSearch
    table: BigTable

    sortParams = {
        column: "num",
        up: false
    }

    async connectedCallback() {
        this.allData = await loadBasicList()
        // this.addEmpty()
        // checkAndCreateEmpty()
        // console.log(this.allData)
        this.render()
        this.querySelector<WordEditor>("word-editor").setData(this.allData)
        this.setSearchBar()
        this.setTable()

        on(EVT.WORDS_COUNT_CHANGED, async () => {
            this.updateDisplayData(await searchSort(this.allData, ""))
            this.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: { cardNum: this.allData.length, rowIdx: 0 }
                })
            )
        })
    }

    render() {
        this.innerHTML = `
            <word-editor></word-editor>
            <words-search></words-search>
            <big-table></big-table>`
    }

    updateDisplayData(value: CombinedWord[]) {
        this.displayData = value
        this.table.setData(this.displayData)
        this.searchBar.update(this.displayData)
    }

    setSearchBar() {
        this.searchBar = this.querySelector("words-search")
        this.searchBar.setData(this.allData)
        this.searchBar.addEventListener("search", async (e: CustomEvent) => {
            const query = e.detail.query
            // this.displayData = await searchSort(this.allData, query)
            // this.table.setData(this.displayData)
            this.updateDisplayData(await searchSort(this.allData, query))
        })
    }

    async setTable() {
        const colums = [
            "num",
            "status",
            "f-progress",
            "f-record",
            "f-autorepeat",
            "b-progress",
            "b-record",
            "b-autorepeat",
            "writings",
            "readings",
            "translation",
            "example"
        ]
        this.table = this.querySelector("big-table")
        // console.log(this.table)
        console.timeLog("t1", "table!")
        // this.table.setParams(colums, "word-btr", fillRow, "word-updated")
        this.table.setParams(colums, "word-btr", fillRow, EVT.WORD_UPDATED)
        // this.table.setData(this.data.slice(100, 150))
        // this.displayData = [...this.allData].reverse()
        // this.displayData = await searchSort(this.allData, "")
        // this.table.setData(this.displayData)
        this.updateDisplayData(await searchSort(this.allData, ""))

        this.dispatchEvent(
            new CustomEvent("card-selected", {
                detail: { cardNum: this.allData.length, rowIdx: 0 }
            })
        )

        this.table.addEventListener("sort", async (e: CustomEvent) => {
            // console.log(e)
            const { column, up } = e.detail
            console.log(column, up)
            // this.sort(column, up)
            await sort(this.displayData, column, up)
            // this.table.setData(this.displayData)
            this.updateDisplayData(this.displayData)
        })
    }
}
