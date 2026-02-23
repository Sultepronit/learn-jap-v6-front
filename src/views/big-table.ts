import css from "./big-table.css?inline"
type FillRow = (elem: HTMLDivElement, card: any) => void

export default class BigTable extends HTMLElement {
    private data: any[] = []
    private rows = []
    private rowsN = 15
    private top = 0

    private rowCss = ""
    private rowTemplate = ""
    private fillRow: FillRow

    setParams(rowTemplate: string, css: string, fillRow: FillRow) {
        this.rowTemplate = rowTemplate
        this.rowCss = css
        this.fillRow = fillRow
    }

    private doScroll(rawDelta: number) {
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
            this.doScroll(e.deltaY)
        })
        // await loadData()
        // this.data = [...data.cards].reverse()
        // this.data = [...getCards()]
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
        for (let i = 0; i < 15; i++) {
            rowTemp.push(`<div class="btr" data-ri="${i}">
                <div class="card-id"></div>
                <div class="writings"></div>
                <div class="readings"></div>
            </div>`)
        }
        this.innerHTML = `<style>${css}</style><div class="big-table">${rowTemp.join('')}</div>`
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