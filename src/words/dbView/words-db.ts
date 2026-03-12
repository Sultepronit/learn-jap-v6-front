import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadAll, loadBasicList } from "../data/data"
import type { CombinedCard } from "../types"
import type WordEditor from "./word-editor"
import type WordsSearch from "./words-search"
import { searchSort, sort } from "./sortSearch"

export default class WordsDb extends HTMLElement {
    allData: CombinedCard[]
    displayData: CombinedCard[]

    searchBar: WordsSearch
    table: BigTable

    sortParams = {
        column: "num",
        up: false
    }
        
    async connectedCallback() {
        this.allData = await loadBasicList()
        // console.log(this.allData)
        this.render()
        this.querySelector<WordEditor>("word-editor").setData(this.allData)
        this.setSearchBar()
        this.setTable()
    }

    render() {
        this.innerHTML = `
            <word-editor></word-editor>
            <words-search></words-search>
            <big-table></big-table>`
    }

    private colums = ["num", "status", "writings", "readings", "translation", "example"]
    private fillRow(rowElem: HTMLDivElement, word: CombinedCard) {
        const strNum = word.num.toString()
        rowElem.dataset.cardNum = strNum
        rowElem.querySelector(".num").textContent = strNum

        rowElem.querySelector(".status").textContent = word.prog?.data.status.toString()

        const writ = rowElem.querySelector(".writings")
        if (word.card?.data.writings.alt) {
            writ.classList.add("blue")
        } else {
            writ.classList.remove("blue")
        }
        writ.textContent = (word.card?.data.writings.main.join(" ") || "")

        rowElem.querySelector(".readings").textContent = word.card?.data.readings.main.join(" ")
        rowElem.querySelector(".translation").textContent = word.card?.data.translation
        rowElem.querySelector(".example").textContent = word.card?.data.example
    }

    updateDisplayData(value: CombinedCard[]) {
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
        this.table = this.querySelector("big-table")
        // console.log(this.table)
        console.timeLog("t1", "table!")
        this.table.setParams(
            this.colums,
            "word-btr",
            this.fillRow,
            "word-updated"
        )
        // this.table.setData(this.data.slice(100, 150))
        // this.displayData = [...this.allData].reverse()
        // this.displayData = await searchSort(this.allData, "")
        // this.table.setData(this.displayData)
        this.updateDisplayData(await searchSort(this.allData, ""))

        this.dispatchEvent(new CustomEvent(
            "card-selected",
            { detail: { cardNum: this.allData.length, rowIdx: 0 } }
        ))

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