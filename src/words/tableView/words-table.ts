import css from "./style.css?inline"
import data from "../data/data"
import type { WordCard } from "../types"

export default class WordsTable extends HTMLElement {
    private data: any[] = []
    // private rows: HTMLDivElement[] = []
    private rows = []

    constructor() {
        super()
    }

    async connectedCallback() {
        this.render()
        this.addEventListener("wheel", (e) => {
            console.log(e)
        })
        await data.init()
        // console.log(data.keys)
        // this.data = [...data.cards].reverse()
        this.data = [...data.cards]
        this.rows.forEach((row, i) => {
            const card = this.data[i]
            // row.dataset.t = card.t
            row.card = card
            row.t = card.t
            row.element.querySelector(".card-id").textContent = card.num
            if (!card.card) {
                data.fillCard(card.num, card.id) 
                return
            }
            row.element.querySelector(".writings").textContent = card.card.data.writings.join(" ")
            row.element.querySelector(".readings").textContent = card.card.data.readings.join(" ")
        })
        document.addEventListener("word-updated", () => {
            console.timeLog("t1", "start update")
            // console.log("e")
            this.rows.forEach((row) => {
                // console.log("t")
                // console.log(row.dataset.t)
                const card = row.card
                if (card.t === Number(row.t)) return
                row.t = card.t
                console.log("change")
                row.element.querySelector(".card-id").textContent = card.num
                if (!card.card) return
                // if (!card.card) console.log("empty?")
                row.element.querySelector(".writings").textContent = card.card.data.writings.join(" ")
                row.element.querySelector(".readings").textContent = card.card.data.readings.join(" ")
            })
            console.timeLog("t1", "end update")
        })
        // this.addEventListener("word-updated", (e) => console.log(e))
    }

    render() {
        const rowTemp: string[] = []
        for (let i = 0; i < 40; i++) {
            rowTemp.push(`<div class="row" data-ri="${i}">
                <div class="row-num">${i + 1}</div>
                <div class="card-id"></div>
                <div class="writings"></div>
                <div class="readings"></div>
            </div>`)
        }
        this.innerHTML = `<style>${css}</style>${rowTemp.join('')}`
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll('.row')
        for (let i = 0; i < 40; i++) {
            this.rows.push({
                element: re[i]
            });
        }
        console.log(this.rows)
    }

}