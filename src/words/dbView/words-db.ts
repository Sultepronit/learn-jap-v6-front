import "./words-db.css"
import type BigTable from "../../views/big-table"
import { loadData } from "../data/data"

export default class WordsDb extends HTMLElement {
    private allData: any[]
    private displayData: any[]
    private table: BigTable
    // private selectedCard: any
        
    async connectedCallback() {
        this.allData = await loadData()
        console.log(this.allData)
        this.render()
        this.setTable()
    }

    // private selectCard(num: number) {
    //     this.selectedCard = this.data[num - 1]
    //     console.log(this.selectedCard)
    //     this.dispatchEvent(new CustomEvent("card-selected", { detail: this.selectedCard }))
    // }

    private render() {
        this.innerHTML = `
        <div>Here will be the editor</div>
        <big-table></big-table>
        `
    }

    private colums = ["num", "writings", "readings", "translation", "example"]
    private fillRow(rowElem: HTMLDivElement, card) {
        rowElem.dataset.cardNum = card.num
        rowElem.querySelector(".num").textContent = card.num

        const writ = rowElem.querySelector(".writings")
        if (card.card?.data.altWriting) {
            writ.classList.add("blue")
        } else {
            writ.classList.remove("blue")
        }
        writ.textContent = (card.card?.data.writings.join(" ") || "")

        rowElem.querySelector(".readings").textContent = card.card?.data.readings.join(" ")
        rowElem.querySelector(".translation").textContent = card.card?.data.translation
        rowElem.querySelector(".example").textContent = card.card?.data.example

        // this.addEventListener("sort", (e: CustomEvent) => {
        //     console.log(e)
        //     const { column, up } = e.detail
        //     console.log(column, up)
        // })
    }

    private sort(column: string, up: boolean) {
        console.log(this.displayData[0])
        switch (column) {
            case "num":
                this.displayData.sort((a, b) => a.num - b.num)
                break
            case "writings":
                this.displayData.forEach(c => c.card)
                this.displayData.sort((a, b) => a.card?.data.writings[0].localeCompare(b.card?.data.writings[0]))
                break
        }
        if (!up) this.displayData.reverse();
        this.table.setData(this.displayData)
    }

    private setTable() {
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