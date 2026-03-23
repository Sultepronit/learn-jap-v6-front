import { on, type EventName } from "../global/events"
import "./big-table.css"
export type BTRow = {
    v: number
    card: any
    element: HTMLDivElement
    refs?: Record<string, HTMLElement>
}

type FillRow = (row: BTRow) => void

export default class BigTable extends HTMLElement {
    data: any[] = []
    rows: BTRow[] = []
    rowsArea: HTMLDivElement
    scroller: HTMLInputElement

    selected: {
        element: HTMLDivElement
        cardNum: number
    } = {
        element: null,
        cardNum: -1
    }
    rowsN = 3
    top = 0

    fillRow: FillRow

    calcRowsN() {
        console.log(this.offsetHeight)
        const comp = Math.round(this.offsetHeight / 35 - 2.1)
        this.rowsN = comp > 3 ? comp : 3
    }

    render(columns: string[], btrClassName: string) {
        window.addEventListener("resize", () => this.resize())
        this.calcRowsN()

        const rowsTemplate = []
        const sortBar = columns
            .map(c => `<div class="btd" data-column="${c}"></div>`)
            .join("")

        const btds = columns.map(c => `<div class="btd ${c}"></div>`).join("")

        for (let i = 0; i < this.rowsN; i++) {
            rowsTemplate.push(`<div class="btr ${btrClassName}" data-i="${i}">
                ${btds}
            </div>`)
        }

        this.innerHTML = `
            <div class="sort-bar ${btrClassName}">${sortBar}</div>
            <div></div>
            <div class="rows-area">${rowsTemplate.join("")}</div>
            <input type="range" class="bt-scroller" min="0" max="1000" value="0">
        `

        const re = this.querySelectorAll<HTMLDivElement>(".btr")
        re.forEach(r => this.rows.push({ v: 0, card: null, element: r }))
        console.log(this.rows)

        this.rowsArea = this.querySelector(".rows-area")
        this.scroller = this.querySelector(".bt-scroller")
    }

    addListeners() {
        this.addEventListener("wheel", e => {
            if (e.ctrlKey) return

            this.doScroll(e.deltaY)
        })

        this.parentElement.addEventListener(
            "card-selected",
            (e: CustomEvent) => {
                const { cardNum, rowIdx } = e.detail
                this.reselect(cardNum, rowIdx)
            }
        )

        this.rowsArea.addEventListener("click", e => {
            const clicked = (e.target as HTMLDivElement).closest(
                ".btr"
            ) as HTMLDivElement
            if (clicked === this.selected.element) return

            const { cardNum, i } = clicked.dataset

            this.parentNode.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: { cardNum: Number(cardNum), rowIdx: Number(i) }
                })
            )
        })

        this.scroller.addEventListener("input", () => {
            const newTop =
                (Number(this.scroller.value) / 1000) *
                (this.data.length - this.rowsN)

            this.navigate(Math.round(newTop - this.top))
        })
    }

    prevSortColumn = null as HTMLDivElement
    setSorting() {
        this.querySelector(".sort-bar").addEventListener("click", e => {
            const clicked = e.target as HTMLDivElement
            const column = clicked.dataset.column
            if (!column) return

            if (this.prevSortColumn !== clicked) {
                clicked.classList.add("active-sort")
                this.prevSortColumn?.classList.remove("active-sort")
                this.prevSortColumn = clicked
            }

            const dirPic = clicked.textContent === "▲" ? "▼" : "▲"
            clicked.textContent = dirPic

            this.dispatchEvent(
                new CustomEvent("sort", {
                    detail: { column, up: dirPic === "▲" }
                })
            )
        })
    }

    updateContent() {
        for (let i = 0; i < this.rowsN; i++) {
            const row = this.rows[i]
            if (row.v === row.card.v) continue

            row.v = row.card.v
            this.fillRow(row)
        }
    }

    // updateCounter = 0
    // outer
    setParams(
        colums: string[],
        btrClassName: string,
        fillRow: FillRow,
        updateEvent: EventName
    ) {
        this.fillRow = fillRow

        this.render(colums, btrClassName)
        this.addListeners()
        this.setSorting()

        on(updateEvent, () => this.updateContent())
    }

    // outer
    setData(data: any[]) {
        this.data = data
        this.top = 0
        this.scroller.value = "0"

        this.resetRows()
    }

    resetRows() {
        this.deselect()
        console.log(this.top)
        for (let i = 0; i < this.rows.length; i++) {
            const di = i + this.top
            const row = this.rows[i]

            if (di >= this.data.length || i >= this.rowsN) {
                row.element.classList.add("hidden")
                continue
            }

            const card = this.data[di]
            // console.log(di, card, row)
            row.card = card
            row.v = card.v
            this.fillRow(row)
            if (card.num === this.selected.cardNum) this.select(card.num, i)

            row.element.classList.remove("hidden")
        }
    }

    rearrange() {
        if (this.rowsN > this.data.length) {
            this.top = 0
        } else if (this.top + this.rowsN > this.data.length) {
            this.top = this.data.length - this.rowsN
        }

        const scrollVal = (
            (this.top / (this.data.length - this.rowsN)) *
            1000
        ).toFixed(0)
        this.scroller.value = scrollVal

        this.resetRows()
    }

    addRow() {
        const element = this.rowsArea.firstElementChild.cloneNode(
            true
        ) as HTMLDivElement
        element.dataset.i = (this.rowsN - 1).toString()
        element.classList.remove("selected")
        this.rowsArea.appendChild(element)
        this.rows.push({ v: 0, card: null, element })
    }

    resize() {
        const prevN = this.rowsN
        this.calcRowsN()
        if (prevN === this.rowsN) return
        console.log("resize!")
        console.log(prevN, this.rowsN)

        for (let i = this.rows.length; i < this.rowsN; i++) {
            console.log(this.rows.length, this.rowsN)
            this.addRow()
        }
        // console.log(this.rows)

        this.rearrange()
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

    // audit!
    navigate(delta: number) {
        this.top += delta
        // console.log(this.top)
        const scrollVal = (
            (this.top / (this.data.length - this.rowsN)) *
            1000
        ).toFixed(0)
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
        if (newTop + this.rowsN > this.data.length)
            newTop = this.data.length - this.rowsN
        if (this.top === newTop) return

        this.navigate(newTop - this.top)
    }

    doScroll(rawDelta: number) {
        this.navigateSafely(rawDelta > 0 ? 3 : -3)
    }
}
