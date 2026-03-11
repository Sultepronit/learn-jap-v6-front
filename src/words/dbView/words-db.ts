import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadAll, loadBasicList } from "../data/data"
import type { CombinedCard } from "../types"
import type WordEditor from "./word-editor"
import type WordsSearch from "./words-search"

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

    async sort(column: string = this.sortParams.column, up: boolean = this.sortParams.up) {
        const doNothing = column === "num" && this.sortParams.column === "num"
        this.sortParams.column = column
        this.sortParams.up = up
        // console.log(this.displayData[0])
        // fallthrough
        if (["writings", "readings"].includes(column)) {
            await loadAll("wordCards")
        } else if (["status"].includes(column)) {
            await loadAll("wordProgs")
        }

        switch (column) {
            case "num":
                if (doNothing) break
                console.log("sorting!")
                this.displayData.sort((a, b) => a.num - b.num)
                break
            case "status":
                this.displayData.sort((a, b) =>
                    a.prog?.data.status - b.prog?.data.status)
                break
            case "writings":
                this.displayData.sort((a, b) =>
                    a.card?.data.writings.main[0].localeCompare(b.card?.data.writings.main[0]))
                break
            case "readings":
                this.displayData.sort((a, b) =>
                    a.card?.data.readings.main[0].localeCompare(b.card?.data.readings.main[0]))
                break
        }
        if (!up) this.displayData.reverse();
        this.table.setData(this.displayData)
    }

    async search(query: string) {
        if (!query) {
            this.displayData = [...this.allData].reverse()
            this.table.setData(this.displayData)
            return
        }
        console.log(query)

        // this.allData.forEach(w => w.card)
        await loadAll("wordCards")
        this.displayData = this.allData.filter(w => {
            return [
                ...w.card.data.writings.main,
                ...(w.card.data.writings.rare || []),
                ...w.card.data.readings.main,
                ...(w.card.data.readings.rare || []),
            ].join("").includes(query)
        })
        // this.table.setData(this.displayData)
        // console.log(re)
        this.sort()
    }

    setSearchBar() {
        this.searchBar = this.querySelector("words-search")
        this.searchBar.setData(this.allData)
        this.searchBar.addEventListener("search", (e: CustomEvent) => {
            const query = e.detail.query
            // console.log(query)
            this.search(query)
        })
    }

    setTable() {
        this.table = this.querySelector("big-table")
        // console.log(this.table)
        console.timeLog("t1", "table!")
        this.table.setParams(
            // this.tdTemplate,
            this.colums,
            "word-btr",
            this.fillRow,
            "word-updated"
        )
        // this.table.setData(this.data.slice(100, 150))
        this.displayData = [...this.allData].reverse()
        this.table.setData(this.displayData)

        this.dispatchEvent(new CustomEvent(
            "card-selected",
            { detail: { cardNum: this.allData.length, rowIdx: 0 } }
        ))


        this.table.addEventListener("sort", (e: CustomEvent) => {
            // console.log(e)
            const { column, up } = e.detail
            console.log(column, up)
            this.sort(column, up)
        })
        // this.selectCard(this.data.length - 1)
        // setTimeout(() => this.table.setData(this.data.slice(120, 150)), 2000)
        // setTimeout(() => this.data.forEach(c => c.card), 2000)
    }
}