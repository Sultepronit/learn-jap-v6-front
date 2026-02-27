import css from "./style.css?inline"
import { getCards, loadData } from "../data/data"

export default class WordsTable extends HTMLElement {
    private data: any[] = []
    private rows = []
    private top = 0

    fillRow(elem: HTMLDivElement, card) {
        elem.querySelector(".card-id").textContent = card.num
        // if (!card.card) return
        // console.log(card.card?.data.readings.join(" "))
        elem.querySelector(".writings").textContent = (card.card?.data.writings.join(" ") || "")
        elem.querySelector(".readings").textContent = card.card?.data.readings.join(" ")
    }

    doScroll(rawDelta: number) {
        const delta = rawDelta > 0 ? 3 : -3
        // console.log(delta)
        this.top += delta

        this.rows.forEach((row, i) => {
            const card = this.data[i + this.top]
            row.card = card
            row.v = card.v
            this.fillRow(row.element, card)
        })
    }

    async connectedCallback() {
        this.render()
        this.addEventListener("wheel", (e) => {
            // console.log(e)
            this.doScroll(e.deltaY)
        })
        await loadData()
        // this.data = [...data.cards].reverse()
        this.data = [...getCards()]
        this.rows.forEach((row, i) => {
            const card = this.data[i]
            row.card = card
            row.v = card.v
            this.fillRow(row.element, card)
        })

        document.addEventListener("word-updated", () => {
            console.timeLog("t1", "start update")
            // console.log("e")
            this.rows.forEach((row) => {
                console.log("t")
                // console.log(row.dataset.t)
                const card = row.card
                if (card.v === row.v) return
                // console.log(card.v, row.v)
                row.v = card.v
                this.fillRow(row.element, card)
            })
            console.timeLog("t1", "end update")
        })
    }

    render() {
        const rowTemp: string[] = []
        for (let i = 0; i < 10; i++) {
            rowTemp.push(`<div class="row" data-ri="${i}">
                <div class="card-id"></div>
                <div class="writings"></div>
                <div class="readings"></div>
            </div>`)
        }
        this.innerHTML = `<style>${css}</style>${rowTemp.join('')}`
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll('.row')
        for (let i = 0; i < 10; i++) {
            this.rows.push({
                element: re[i]
            });
        }
        console.log(this.rows)
    }

}