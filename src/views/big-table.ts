// import css from "./big-table.css?inline"
import "./big-table.css"
type FillRow = (elem: HTMLDivElement, card: any) => void
type Row = {
    element: HTMLDivElement,
    v: number,
    card: any
}

export default class BigTable extends HTMLElement {
    private data: any[] = []
    private rows: Row[] = []
    private rowsArea: HTMLDivElement
    // private selected: HTMLDivElement
    private selected: {
        element: HTMLDivElement,
        cardNum: number
    } = {
        element: null,
        cardNum: -1
    }
    private rowsN = 15
    private top = 0

    private columns: string[]
    private btrClassName = ""
    private fillRow: FillRow
    private updateEvent = ""

    private deselect() {
        this.selected.element?.classList.remove("selected")
        this.selected.element = null
    }

    private select(cardNum: number, rowIdx: number) {
        this.selected.cardNum = cardNum
        if (!rowIdx && rowIdx !== 0) {
            rowIdx = this.data.findIndex(c => c.num === cardNum)
        }
        if (rowIdx < 0) return

        this.selected.element = this.rows[rowIdx].element
        this.selected.element.classList.add("selected")
        // console.log(this.selected)
    }

    private reselect(cardNum: number, rowIdx: number) {
        this.deselect()
        this.select(cardNum, rowIdx)
    }

    private navigate(delta: number) {
        this.top += delta

        this.deselect();

        this.rows.forEach((row, i) => {
            const card = this.data[i + this.top]

            if (card.num === this.selected.cardNum) this.select(card.num, i)

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

        this.navigate(newTop - this.top)
    }

    private doScroll(rawDelta: number) {
        this.navigateSafely(rawDelta > 0 ? 3 : -3)
    }

    connectedCallback() {
        // this.render()
        this.addEventListener("wheel", (e) => {
            this.doScroll(e.deltaY)
        })
        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            // console.log(e.detail)
            const { cardNum, rowIdx } = e.detail
            this.reselect(cardNum, rowIdx)
        })
    }

    private render() {
        const rowsTemp = []
        const bth = this.columns.map(c => `<div class="btd ${c}">${c}</div>`).join("")
        const btd = this.columns.map(c => `<div class="btd ${c}"></div>`).join("")
        for (let i = 0; i < this.rowsN; i++) {
            rowsTemp.push(`<div class="btr ${this.btrClassName}" data-i=${i} hidden">
                ${btd}
            </div>`)
        }
            
        this.innerHTML = `<div class="big-table">
                <div class="btr- ${this.btrClassName}">
                    ${bth}
                </div>
                <div class="rows-area">${rowsTemp.join("")}</div>
            </div>`
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll<HTMLDivElement>('.btr')
        re.forEach(r => this.rows.push({ element: r, v: 0, card: null }))
        console.log(this.rows)

        this.rowsArea = this.querySelector(".rows-area")
        // console.log(this.rowsArea)

        this.rowsArea.addEventListener("click", (e) => {
            const clicked = (e.target as HTMLDivElement).closest(".btr")
            if (clicked === this.selected.element) return

            // console.log(clicked)
            // console.log(clicked.dataset.i)
            const { cardNum, i } = clicked.dataset
            // console.log(cardNum, i)
            this.parentNode.dispatchEvent(new CustomEvent(
            "card-selected",
            { detail: { cardNum: Number(cardNum), rowIdx: Number(i) } }
        ))
        })
    }

    setParams(
        // tdTemplate: string,
        colums: string[],
        btrClassName: string,
        fillRow: FillRow,
        updateEvent: string
    ) {
        this.columns = colums
        this.btrClassName = btrClassName
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
        // this.parentNode.dispatchEvent(new CustomEvent(
        //     "card-selected",
        //     { detail: { num: this.data[0].num, rowI: 0 } }
        // ))
    }
}