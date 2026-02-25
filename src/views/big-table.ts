// import css from "./big-table.css?inline"
import "./big-table.css"
type FillRow = (elem: HTMLDivElement, card: any) => void

export default class BigTable extends HTMLElement {
    private data: any[] = []
    private rows = []
    private rowsArea: HTMLDivElement
    private rowsN = 15
    private top = 0

    private rowCss = ""
    private tdTemplate = ""
    private btrClassName = ""
    private fillRow: FillRow
    private updateEvent = ""

    private navigate(delta: number) {
        this.top += delta

        this.rows.forEach((row, i) => {
            const card = this.data[i + this.top]
            row.card = card
            row.v = card.v
            this.fillRow(row.element, card)
        })
    }

    private navigateSafely(delta: number) {
        if (this.data.length < this.rowsN) return
        let newTop = this.top + delta
        if (newTop < 0) newTop = 0
        if (newTop + this.rowsN > this.data.length) newTop = this.data.length - this.rowsN
        if (this.top === newTop) return

        this.top = newTop
        // console.log(newTop)
        this.navigate(0)
    }

    private doScroll(rawDelta: number) {
        this.navigateSafely(rawDelta > 0 ? 3 : -3)
    }

    connectedCallback() {
        // this.render()
        this.addEventListener("wheel", (e) => {
            this.doScroll(e.deltaY)
        })
        this.parentElement.addEventListener("card-selected", (e) => {
            console.log(e.detail)
        })
    }

    private render() {
        const rowsTemp = new Array(this.rowsN)
            .fill(`<div class="btr ${this.btrClassName} hidden">${this.tdTemplate}</div>`)
            .join("")
            
        this.innerHTML = `<style>${this.rowCss}</style>
            <div class="big-table">
                <div class="rows-area">${rowsTemp}</div>
            </div>`
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll('.btr')
        re.forEach(r => this.rows.push({ element: r}))
        console.log(this.rows)

        this.rowsArea = this.querySelector(".rows-area")
        console.log(this.rowsArea)
        this.rowsArea.addEventListener("click", (e) => {
            console.log((e.target as HTMLDivElement).closest(".btr"))
        })
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
        this.top = 0
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
        // this.data.forEach(c => console.log(c.card?.data))
        // this.data.forEach(c => c.card)
        // this.rows[this.rowsN - 1].element.classList.add("hidden")
        this.parentNode.dispatchEvent(new CustomEvent(
            "card-selected",
            { detail: this.data[0].num }
        ))
    }
}