import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadData } from "../data/data"

export default class WordsDb extends HTMLElement {
    private data: any[]
    private table: BigTable
        
    async connectedCallback() {
        this.data = await loadData()
        console.log(this.data)
        this.render()
        this.setTable()
    }

    private render() {
        this.innerHTML = `
        <div>Here will be the editor</div>
        <big-table></big-table>
        `
    }

    private tdTemplate = `
        <div class="btd card-id">*</div>
        <div class="btd writings">*</div>
        <div class="btd readings">*</div>`
    private rowCss = ""
    private fillRow(rowElem: HTMLDivElement, card) {
        rowElem.dataset.cardNum = card.num
        rowElem.querySelector(".card-id").textContent = card.num
        rowElem.querySelector(".writings").textContent = (card.card?.data.writings.join(" ") || "")
        rowElem.querySelector(".readings").textContent = card.card?.data.readings.join(" ")
    }

    private setTable() {
        this.table = this.querySelector("big-table")
        console.log(this.table)
        console.timeLog("t1", "table!")
        this.table.setParams(
            this.tdTemplate,
            "word-btr",
            this.rowCss,
            this.fillRow,
            "word-updated"
        )
        // this.table.setData(this.data.slice(100, 150))
        this.table.setData(this.data.reverse())
        // setTimeout(() => this.table.setData(this.data.slice(120, 150)), 2000)
    }
}