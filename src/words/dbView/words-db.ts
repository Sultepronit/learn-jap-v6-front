import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadAll, loadBasicList } from "../data/data"
import type { CombinedWord } from "../types"
import type WordEditor from "./word-editor"
import type WordsSearch from "./words-search"
import { rearrangeData, sort } from "./sortSearch"
import { EVT, on } from "../../global/events"
import fillRow from "./fillBTRow"

export default class WordsDb extends HTMLElement {
    allData: CombinedWord[]
    displayData: CombinedWord[]

    searchBar: WordsSearch
    table: BigTable

    sortType = ""
    searching = false

    async connectedCallback() {
        this.allData = await loadBasicList()
        this.render()

        this.querySelector<WordEditor>("word-editor").setData(this.allData)
        this.setSearchBar()
        this.setTable()

        on(EVT.WORDS_COUNT_CHANGED, async () => {
            // this.updateDisplayData(await searchSort(this.allData, ""))
            this.updateDisplayData(await rearrangeData(this.allData))
            this.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: { cardNum: this.allData.length, rowIdx: 0 }
                })
            )
        })

        on(EVT.WORD_UPDATES_RECEIVED, async ({ type }) => {
            console.log(type)
            if (type === this.sortType) {
                this.updateDisplayData(await rearrangeData(this.allData))
            } else if (this.searching && type === "wordCards") {
                console.log("here we go!")
                this.updateDisplayData(await rearrangeData(this.allData))
            }
            console.log(this.searching, type === "wordCards")
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
        // this.searchBar.addEventListener("search", async (e: CustomEvent) => {
        this.addEventListener("search", async (e: CustomEvent) => {
            this.searching = !!e.detail.query
            await loadAll("wordCards")
            this.updateDisplayData(await rearrangeData(this.allData, e.detail.query))
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
            "t",
            "writings",
            "readings",
            "translation",
            "example"
        ]
        this.table = this.querySelector("big-table")
        // console.log(this.table)
        console.timeLog("t1", "table!")
        this.table.setParams(colums, "word-btr", fillRow, EVT.WORD_UPDATED)
        // this.updateDisplayData(await searchSort(this.allData, ""))
        this.updateDisplayData(await rearrangeData(this.allData))

        this.dispatchEvent(
            new CustomEvent("card-selected", {
                detail: { cardNum: this.allData.length, rowIdx: 0 }
            })
        )

        this.table.addEventListener("sort", async (e: CustomEvent) => {
            const { column, up } = e.detail
            console.log(column, up)

            if (["writings", "readings"].includes(column)) {
                await loadAll("wordCards")
                this.sortType = "wordCards"
            } else if (
                [
                    "status",
                    "f-progress",
                    "b-progress",
                    "f-record",
                    "f-autorepeat",
                    "b-record",
                    "b-autorepeat",
                    "t"
                ].includes(column)
            ) {
                await loadAll("wordProgs")
                this.sortType = "wordProgs"
            } else {
                this.sortType = ""
            }
            console.log(this.sortType)

            await sort(this.displayData, column, up)
            this.updateDisplayData(this.displayData)
        })
    }
}
