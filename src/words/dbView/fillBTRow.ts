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

export default function fillRow(row: BTRow) {
    getRowRefs(row)
    // console.log(row)
    const word = row.card as CombinedWord
    row.v = word.v

    computeCommon(word)

    const strNum = word.num.toString()
    row.element.dataset.cardNum = strNum
    row.refs.num.textContent = strNum

    row.refs.status.textContent = word.prog?.data.status.toString()

    if (word.card?.data.writings.alt) {
        row.refs.mainWrit.classList.add("blue")
    } else {
        row.refs.mainWrit.classList.remove("blue")
    }

    if (word.comp) {
        if (word.comp.common.writings.main.isHtml) {
            row.refs.mainWrit.innerHTML = word.comp.common.writings.main.value
        } else {
            row.refs.mainWrit.textContent = word.comp.common.writings.main.value
        }

        if (word.comp.common.writings.rare) {
            if (word.comp.common.writings.rare.isHtml) {
                row.refs.rareWrit.innerHTML =
                    word.comp.common.writings.rare.value
            } else {
                row.refs.rareWrit.textContent =
                    word.comp.common.writings.rare.value
            }
        } else {
            row.refs.rareWrit.textContent = ""
        }

        row.refs.mainRead.textContent = word.comp.common.readings.main
        row.refs.rareRead.textContent = word.comp.common.readings.rare || ""
    } else {
        row.refs.mainWrit.textContent = ""
        row.refs.rareWrit.textContent = ""
        row.refs.mainRead.textContent = ""
        row.refs.rareRead.textContent = ""
    }

    // row.element.querySelector(".readings").textContent = word.card?.data.readings.main.join(" ")
    row.element.querySelector(".translation").textContent =
        word.card?.data.translation
    row.element.querySelector(".example").textContent = word.card?.data.example
}
