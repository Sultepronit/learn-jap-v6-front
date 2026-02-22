import data from "../data/data";
import type { WordCard } from "../types";

export default class WordsTable extends HTMLElement {
    private data: any[] = []
    private rows: HTMLDivElement[] = []

    constructor() {
        super()
    }

    async connectedCallback() {
        this.render()
        await data.init()
        // console.log(data.keys)
        this.data = [...data.cards].reverse()
        this.rows.forEach( async (row, i) => {
            const card = this.data[i];
            row.dataset.t = card.t
            row.querySelector(".card-id").textContent = card.num
            if (!card.card) {
                data.fillCard(card.num + 9, card.id) 
                return
            }
            // const card = await data.getCard(this.data[i]) as WordCard
            // row.querySelector(".writings").textContent = card.data.writings.join("  ")
        })
        document.addEventListener("word-updated", () => {
            console.log("e")
            this.rows.forEach( async (row, i) => {
                console.log("t")
                // console.log(row.dataset.t)
                const card = this.data[i];
                if (card.t === Number(row.dataset.t)) return
                row.dataset.t = card.t
                console.log("change")
                row.querySelector(".card-id").textContent = card.num
                if (!card.card) return
                // const card = await data.getCard(this.data[i]) as WordCard
                row.querySelector(".writings").textContent = card.card.data.writings.join("  ")
            })
            console.timeLog("t1")
        })
        // this.addEventListener("word-updated", (e) => console.log(e))
    }

    render() {
        const rowTemp: string[] = []
        for (let i = 0; i < 10; i++) {
            rowTemp.push(`<div class="row" data-ri="${i}">
                <div class="row-num">${i + 1}</div>
                <div class="card-id"></div>
                <div class="writings"></div>
            </div>`)
        }
        this.innerHTML = rowTemp.join('')
        this.rows = Array.from(this.querySelectorAll('.row'))
        console.log(this.rows)
    }

}