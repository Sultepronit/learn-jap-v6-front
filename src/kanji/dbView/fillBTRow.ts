import SmartRef from "../../global/SmartRef"
import { toCamelCase } from "../../helpers/text"
import type { BTRow } from "../../views/big-table"
import type { CombinedKanji } from "../types"

function collectRefs(row: BTRow) {
    if (row.refs) return

    const refs = row.element.querySelectorAll<HTMLElement>("[data-ref]")
    row.refs = {}
    refs.forEach(el => {
        const kebab = el.dataset.ref
        row.refs[toCamelCase(kebab)] = new SmartRef(el)
    })
    console.log(row.refs)
}

export default function fillRow(row: BTRow) {
    collectRefs(row)
    console.log(row)
    const k = row.card as CombinedKanji
    row.v = k.v

    const strNum = k.num.toString()
    row.element.dataset.cardNum = strNum
    row.refs.num.text(strNum)

    row.refs.kanji.text(k.id)

    row.refs.status.text(k.prog?.data.status)
    row.refs.progress.text(k.prog?.data.progress)
    row.refs.record.text(k.prog?.data.record)
    row.refs.autorepeat.text(k.prog?.data.autorepeat ? "●" : "")
    const t = k.prog?.data.t
    row.refs.t.text(t ? new Date(t * 1000).toISOString().slice(2, 10) : "")

    row.refs.readings.text(k.card.data.readings)
    row.refs.mainLinks.text(k.card.data.links.main.join(", "))
    if (k.card.data.links.other) {
        row.refs.otherLinks.text(k.card.data.links.other.join(", "))
    } else {
        row.refs.otherLinks.text("")
    }
}
