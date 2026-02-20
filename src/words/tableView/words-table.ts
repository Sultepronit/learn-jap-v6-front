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
        console.log(data.keys)
        this.data = [...data.keys].reverse()
        this.rows.forEach( async (row, i) => {
            row.querySelector(".card-id").textContent = this.data[i]
            const card = await data.getCard(this.data[i]) as WordCard
            row.querySelector(".writings").textContent = card.data.writings.join("  ")
        })
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