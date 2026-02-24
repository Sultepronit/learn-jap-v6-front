// import css from "./big-table.css?inline"
import "./big-table.css"
type FillRow = (elem: HTMLDivElement, card: any) => void

export default class BigTable extends HTMLElement {
    private data: any[] = []
    private rows = []
    private rowsN = 15
    private top = 0

    private rowCss = ""
    private tdTemplate = ""
    private btrClassName = ""
    private fillRow: FillRow
    private updateEvent = ""

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

    connectedCallback() {
        // this.render()
        this.addEventListener("wheel", (e) => {
            this.doScroll(e.deltaY)
        })
        
    }

    private render() {
        const rowsTemp = new Array(this.rowsN)
            .fill(`<div class="btr ${this.btrClassName} hidden">${this.tdTemplate}</div>`).join("")
            
        this.innerHTML = `<style>${this.rowCss}</style>
            <div class="big-table">${rowsTemp}</div>`
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll('.btr')
        re.forEach(r => this.rows.push({ element: r}))
        console.log(this.rows)
    }

    setParams(
        tdTemplate: string,
        btrClassName: string,
        css: string,
        fillRow: FillRow,
        updateEvent: string
    ) {
        this.tdTemplate = tdTemplate
        this.btrClassName = btrClassName
        this.rowCss = css
        this.fillRow = fillRow
        this.updateEvent = updateEvent

        this.render()

        document.addEventListener(this.updateEvent, () => {
            console.timeLog("t1", "start update")
            // console.log("e")
            this.rows.forEach((row, i) => {
                if (i >= this.data.length) {
                    row.element.classList.add("hidden")
                    return
                }
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

    setData(data: any[]) {
        this.data = data
        this.rows.forEach((row, i) => {
            if (i >= this.data.length) {
                row.element.classList.add("hidden")
                return
            }
            const card = this.data[i]
            row.card = card
            row.v = card.v
            this.fillRow(row.element, card)
            row.element.classList.remove("hidden")
            // console.log(row)
        })
        // this.rows[this.rowsN - 1].element.classList.add("hidden")
    }
}