import { EVT, on } from "../../global/events"
import { loadBasicList as loadBasicWordsList, wordsIndex } from "../../words/data/data"
import { computeCommon } from "../../words/parsers/readingsWritings"

import type { CombinedKanji } from "../types"

let wordsList = null
export async function papareKanji(k: CombinedKanji) {
    if (!k.comp) k.comp = {}

    while (!k.prog) {
        await new Promise(res => on(EVT.KANJI_UPDATED, res, true))
    }

    k.comp.stage = k.prog.data.status > 0 ? "repeat" : "learn"

    if (!wordsList) {
        wordsList = await loadBasicWordsList()
    }

    const ml = k.card.data.links.main
    const ol = k.card.data.links.other
    if (ml.length > 0) {
        k.comp.words = { main: await linksToWords(ml) }

        if (ol) {
            k.comp.words.other = await linksToWords(ol, true)
        }
    } else if (ol) {
        k.comp.words = { other: await linksToWords(ol) }
    }
}

async function linksToWords(links: number[], other = false) {
    const re = []
    for (const l of links) {
        const word = wordsIndex.get(l)
        while (!word.card) {
            await new Promise(res => on(EVT.WORD_UPDATED, res, true))
        }
        computeCommon(word)

        const wComp = word.comp.common

        const mainWrit = wComp.writings.main.value
        // const wordContent = [wComp.writings.main.value]
        const wordContent = [
            word.card.data.writings.alt ? `<span class="alt">${mainWrit}</span>` : mainWrit
        ]
        if (wComp.writings.rare) {
            wordContent.push(`<span class="rare">${wComp.writings.rare.value}</span>`)
        }
        wordContent.push(":", wComp.readings.main)
        if (wComp.readings.rare) {
            wordContent.push(`<span class="rare">${wComp.readings.rare}</span>`)
        }
        wordContent.push("—", word.card.data.translation)

        const classAttr = other ? ` class="other-link"` : ""
        re.push(`<div${classAttr}>${wordContent.join(" ")}</div>`)
    }

    return re
}
