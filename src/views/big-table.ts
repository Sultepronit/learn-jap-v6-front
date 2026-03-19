// import css from "./big-table.css?inline"
import "./big-table.css"
export type BTRow = {
    v: number
    card: any
    element: HTMLDivElement
    refs?: Record<string, HTMLElement>
}
// type FillRow = (elem: HTMLDivElement, refs: Record<string, HTMLElement>, card: any) => void
type FillRow = (row: BTRow) => void

export default class BigTable extends HTMLElement {
    data: any[] = []
    rows: BTRow[] = []
    rowsArea: HTMLDivElement
    scroller: HTMLInputElement

    selected: {
        element: HTMLDivElement,
        cardNum: number
    } = {
        element: null,
        cardNum: -1
    }
    rowsN = 3
    top = 0
    lastHight = 0

    columns: string[]
    btrClassName = ""
    fillRow: FillRow
    updateEvent = ""

    connectedCallback() {
        this.addEventListener("wheel", (e) => {
            if (e.ctrlKey) return

            this.doScroll(e.deltaY)
        })
        this.parentElement.addEventListener("card-selected", (e: CustomEvent) => {
            // console.log(e.detail)
            const { cardNum, rowIdx } = e.detail
            this.reselect(cardNum, rowIdx)
        })
    }

    calcRowsN() {
        console.log(this.offsetHeight)
        const comp = Math.round(this.offsetHeight / 35 - 2.1)
        this.rowsN = comp > 3 ? comp : 3
    }

    render() {
        window.addEventListener("resize", () => this.resize())
        this.calcRowsN()

        const rowsTemplate = []
        const sortBar = this.columns.map(c => `<div class="btd" data-column="${c}"></div>`).join("")
        const btd = this.columns.map(c => `<div class="btd ${c}"></div>`).join("")
        for (let i = 0; i < this.rowsN; i++) {
            rowsTemplate.push(`<div class="btr ${this.btrClassName}" data-i="${i}">
                ${btd}
            </div>`)
        }
            
        this.innerHTML = `
            <div class="sort-bar ${this.btrClassName}">${sortBar}</div>
            <div></div>
            <div class="rows-area">${rowsTemplate.join("")}</div>
            <input type="range" class="bt-scroller" min="0" max="1000" value="0">
        `
        // this.rows = Array.from(this.querySelectorAll('.row'))
        const re = this.querySelectorAll<HTMLDivElement>('.btr')
        re.forEach(r => this.rows.push({ v: 0, card: null, element: r }))
        console.log(this.rows)

        this.querySelector(".sort-bar").addEventListener("click", (e) => {
            const ch = e.target as HTMLDivElement
            const column = ch.dataset.column
            if (!column) return
            // console.log(column)
            
            this.querySelector(".active-sort")?.classList.remove("active-sort")
            ch.classList.add("active-sort")

            ch.textContent = ch.textContent === "▲" ? "▼" : "▲"
            // this.parentNode.dispatchEvent(new CustomEvent("sort", { detail: {
            this.dispatchEvent(new CustomEvent("sort", { detail: {
                column, up: ch.textContent === "▲"
            } }))
        })

        this.rowsArea = this.querySelector(".rows-area")
        // console.log(this.rowsArea)
        this.scroller = this.querySelector(".bt-scroller")

        this.rowsArea.addEventListener("click", (e) => {
            const clicked = (e.target as HTMLDivElement).closest(".btr") as HTMLDivElement
            if (clicked === this.selected.element) return

            // console.log(clicked)
            // console.log(clicked.dataset.i)
            const { cardNum, i } = clicked.dataset
            console.log(cardNum, i)
            this.parentNode.dispatchEvent(new CustomEvent(
                "card-selected",
                { detail: { cardNum: Number(cardNum), rowIdx: Number(i) } }
            ))
        })

        this.scroller.addEventListener("input", () => {
            // this.scroller.value = (this.top / (this.data.length - this.rowsN) * 1000).toString()
            const newTop = Number(this.scroller.value) / 1000 * (this.data.length - this.rowsN)
            // console.log(newTop)
            this.navigate(Math.round(newTop - this.top))
        })
    }

    // updateCounter = 0
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
        // this.resize()

        document.addEventListener(this.updateEvent, () => {
            // console.log("update:", ++this.updateCounter)
            this.rows.forEach((row, i) => {
                // if (i >= this.data.length) {
                //     row.element.classList.add("hidden")
                //     return
                // }
                const card = row.card
                if (card.v === row.v) return
                // console.log(card.v, row.v)
                row.v = card.v
                // this.fillRow(row.element, card)
                this.fillRow(row)
            })
        })
    }

    setData(data: any[]) {
        this.data = data
        this.top = 0
        this.scroller.value = "0"

        this.deselect()

        this.rows.forEach((row, i) => {
            // console.log(i)
            if (i >= this.data.length || i >= this.rowsN) {
                row.element.classList.add("hidden")
                return
            }
            const card = this.data[i]
            row.card = card
            row.v = card.v
            // this.fillRow(row.element, card)
            this.fillRow(row)
            row.element.classList.remove("hidden")

            if (card.num === this.selected.cardNum) this.select(card.num, i)
        })
    }

    reRender() {
        // console.log(this.top + this.rowsN, this.data.length)
        if (this.top + this.rowsN > this.data.length) {
            this.top = this.data.length - this.rowsN
        }

        const scrollVal = (this.top / (this.data.length - this.rowsN) * 1000).toFixed(0)
        this.scroller.value = scrollVal

        this.deselect()
    
        for (let i = 0; i < this.rows.length; i++) {
            const di = i + this.top
            const row = this.rows[i]

            if (di >= this.data.length || i >= this.rowsN) {
                row.element.classList.add("hidden")
                continue
            }

            const card = this.data[di]
            row.card = card
            row.v = card.v
            // this.fillRow(row.element, card)
            this.fillRow(row)
            if (card.num === this.selected.cardNum) this.select(card.num, i)

            row.element.classList.remove("hidden")
        }
    }

    addRow() {       
        const element = this.rowsArea.firstElementChild.cloneNode(true) as HTMLDivElement
        element.dataset.i = (this.rowsN - 1).toString()
        element.classList.remove("selected")
        this.rowsArea.appendChild(element)
        // this.rows.push({ element, v: 0, card: null })
        this.rows.push({ v: 0, card: null, element })
    }

    resize() {
        const prevN = this.rowsN
        this.calcRowsN()
        if (prevN === this.rowsN) return;
        console.log("resize!")
        console.log(prevN, this.rowsN)

        for (let i = this.rows.length; i < this.rowsN; i++) {
            console.log(this.rows.length, this.rowsN)
            this.addRow()
        }
        // console.log(this.rows)

        this.reRender()
    }

    deselect() {
        this.selected.element?.classList.remove("selected")
        this.selected.element = null
    }

    select(cardNum: number, rowIdx: number) {
        this.selected.cardNum = cardNum
        if (rowIdx < 0) {
            rowIdx = this.rows.findIndex(r => r.card.num === cardNum)
        }

        if (rowIdx < 0) return
        this.selected.element = this.rows[rowIdx].element
        this.selected.element.classList.add("selected")
    }

    reselect(cardNum: number, rowIdx: number) {
        this.deselect()
        this.select(cardNum, rowIdx)
    }

    navigate(delta: number) {
        this.top += delta
        // console.log(this.top)
        const scrollVal = (this.top / (this.data.length - this.rowsN) * 1000).toFixed(0)
        this.scroller.value = scrollVal
        // console.log(scrollVal, this.scroller.value)

        this.deselect()

        this.rows.forEach((row, i) => {
            const card = this.data[i + this.top]

            row.card = card
            row.v = card.v
            // this.fillRow(row.element, card)
            this.fillRow(row)
            if (card.num === this.selected.cardNum) this.select(card.num, i)
        })
    }

    navigateSafely(delta: number) {
        // console.log(this.data.length)
        if (this.data.length < this.rowsN) return
        let newTop = this.top + delta
        if (newTop < 0) newTop = 0
        if (newTop + this.rowsN > this.data.length) newTop = this.data.length - this.rowsN
        if (this.top === newTop) return

        this.navigate(newTop - this.top)
    }

    doScroll(rawDelta: number) {
        this.navigateSafely(rawDelta > 0 ? 3 : -3)
    }
}