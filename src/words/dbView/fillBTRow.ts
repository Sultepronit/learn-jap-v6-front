import SmartRef from "../../global/SmartRef"
import { toCamelCase } from "../../helpers/text"
import type { BTRow } from "../../views/big-table"
import { computeCommon } from "../parsers/readingsWritings"
import type { CombinedWord } from "../types"

function collectRefs(row: BTRow) {
    if (row.refs) return

    const writ = row.element.querySelector(".writings")
    const read = row.element.querySelector(".readings")
    writ.innerHTML = `<span data-ref="main-writ"></span><span class="rare" data-ref="rare-writ"></span>`
    read.innerHTML = `<span data-ref="main-read"></span><span class="rare" data-ref="rare-read"></span>`

    const refs = row.element.querySelectorAll<HTMLElement>("[data-ref]")
    row.refs = {}
    refs.forEach(el => {
        const kebab = el.dataset.ref
        row.refs[toCamelCase(kebab)] = new SmartRef(el)
    })
    // console.log(row.refs)
}

export default function fillRow(row: BTRow) {
    collectRefs(row)
    // console.log(row)
    const word = row.card as CombinedWord
    row.v = word.v

    const strNum = word.num.toString()
    row.element.dataset.cardNum = strNum
    row.refs.num.text(strNum)

    row.refs.status.text(word.prog?.data.status)
    row.refs.fProgress.text(word.prog?.data.f.progress)
    row.refs.bProgress.text(word.prog?.data.b.progress)
    row.refs.fRecord.text(word.prog?.data.f.record)
    row.refs.bRecord.text(word.prog?.data.b.record)
    row.refs.fAutorepeat.text(word.prog?.data.f.autorepeat ? "✔️" : "")
    row.refs.bAutorepeat.text(word.prog?.data.b.autorepeat ? "✔️" : "")
    const t = word.prog?.data.t
    row.refs.t.text(t ? new Date(t * 1000).toISOString().slice(2, 10) : "")
    // row.refs.t.text(t ? t : "")

    if (word.card?.data.writings.alt) {
        row.refs.mainWrit.addClass("alt")
    } else {
        row.refs.mainWrit.removeClass("alt")
    }

    computeCommon(word)
    if (word.comp) {
        const writs = word.comp.common.writings
        row.refs.mainWrit.text(writs.main.value, writs.main.isHtml)

        if (writs.rare) {
            row.refs.rareWrit.text(writs.rare.value, writs.rare.isHtml)
        } else {
            row.refs.rareWrit.text("")
        }
    } else {
        row.refs.mainWrit.text("")
        row.refs.rareWrit.text("")
    }

    row.refs.mainRead.text(word.comp?.common.readings.main)
    row.refs.rareRead.text(word.comp?.common.readings.rare)
    row.refs.translation.html(word.card?.data.translation)
    row.refs.example.text(word.card?.data.example)
}
