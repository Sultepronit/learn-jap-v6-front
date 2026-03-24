import SmartRef from "../../global/SmartRef"
import { toCamelCase } from "../../helpers/text"
import type { BTRow } from "../../views/big-table"
import { computeCommon } from "../parsers/readingsWritings"
import type { CombinedWord } from "../types"

function getRowRefs(row: BTRow) {
    if (row.refs) return
    row.refs = {
        num: row.element.querySelector(".num"),
        status: row.element.querySelector(".status")
    }
    const writ = row.element.querySelector(".writings")
    const read = row.element.querySelector(".readings")

    if (writ.innerHTML === "") {
        // row can be clonned
        writ.innerHTML = `<span class="main"></span><span class="rare"></span>`
        read.innerHTML = `<span class="main">*</span><span class="rare">*</span>`
    }
    row.refs.mainWrit = writ.querySelector(".main")
    row.refs.rareWrit = writ.querySelector(".rare")
    row.refs.mainRead = read.querySelector(".main")
    row.refs.rareRead = read.querySelector(".rare")
}

function collectRefs(row: BTRow) {
    if (row.refs) return
    const refs = row.element.querySelectorAll<HTMLElement>("[data-ref]")
    // const refs = this.querySelectorAll<HTMLElement>(":scope > [data-ref]")
    row.refs = {}
    refs.forEach(el => {
        const kebab = el.dataset.ref
        row.refs[toCamelCase(kebab)] = new SmartRef(el)
    })
    console.log(row.refs)
    row.refs.writings.html(
        `<span class="main"></span><span class="rare"></span>`
    )
    row.refs.mainWrit = new SmartRef(
        row.refs.writings.el.querySelector(".main")
    )
}

export default function fillRow(row: BTRow) {
    // getRowRefs(row)
    collectRefs(row)
    // console.log(row)
    const word = row.card as CombinedWord
    row.v = word.v

    const strNum = word.num.toString()
    row.element.dataset.cardNum = strNum
    row.refs.num.text(strNum)

    row.refs.status.text(word.prog?.data.status)

    // if (word.card?.data.writings.alt) {
    //     row.refs.mainWrit.classList.add("blue")
    // } else {
    //     row.refs.mainWrit.classList.remove("blue")
    // }

    computeCommon(word)
    if (word.comp) {
        const writs = word.comp.common.writings
        row.refs.mainWrit.text(writs.main.value, writs.main.isHtml)

        // if (word.comp.common.writings.main.isHtml) {
        //     row.refs.mainWrit.innerHTML = word.comp.common.writings.main.value
        // } else {
        //     row.refs.mainWrit.textContent = word.comp.common.writings.main.value
        // }

        // if (word.comp.common.writings.rare) {
        //     if (word.comp.common.writings.rare.isHtml) {
        //         row.refs.rareWrit.innerHTML =
        //             word.comp.common.writings.rare.value
        //     } else {
        //         row.refs.rareWrit.textContent =
        //             word.comp.common.writings.rare.value
        //     }
        // } else {
        //     row.refs.rareWrit.textContent = ""
        // }

        // row.refs.mainRead.textContent = word.comp.common.readings.main
        // row.refs.rareRead.textContent = word.comp.common.readings.rare || ""
        row.refs.translation.html(word.card?.data.translation)
        row.refs.example.text(word.card?.data.example)
    } else {
        row.refs.mainWrit.text("")
        // row.refs.mainWrit.textContent = ""
        // row.refs.rareWrit.textContent = ""
        // row.refs.mainRead.textContent = ""
        // row.refs.rareRead.textContent = ""
    }
}
