import { EVT, on } from "../../global/events"
import { loadBasicList as loadBasicWordsList, wordsIndex } from "../../words/data/data"
import { computeCommon } from "../../words/parsers/readingsWritings"

import type { CombinedKanji } from "../types"

let wordsList = null
export async function papareKanji(k: CombinedKanji) {
    if (!wordsList) {
        wordsList = await loadBasicWordsList()
    }

    if (!k.comp) k.comp = {}

    while (!k.prog) {
        await new Promise(res => on(EVT.KANJI_UPDATED, res, true))
    }
    // console.log(word.prog)
    k.comp.stage = k.prog.data.status > 0 ? "repeat" : "learn"
    // console.log(wordsIndex.get(k.card.data.links.main[0]))
    if (k.card.data.links.main.length > 0) {
        k.comp.words = { main: [] }

        const ml = k.card.data.links.main
        for (const l of ml) {
            console.log(l)
            const word = wordsIndex.get(l)
            console.log(word)
            while (!word.card) {
                await new Promise(res => on(EVT.WORD_UPDATED, res, true))
            }
            computeCommon(word)
            console.log(word.card.data)
            const comp = word.comp.common
            // const wordDisplay = comp.writings.main.value + comp.readings.main
            const wordContent = [comp.writings.main.value]
            if (comp.writings.rare) {
                wordContent.push(`<span class="rare">${comp.writings.rare.value}</span>`)
            }
            wordContent.push(" : ", comp.readings.main)
            if (comp.readings.rare) {
                wordContent.push(`<span class="rare">${comp.readings.rare}</span>`)
            }
            wordContent.push(" — ", word.card.data.translation)

            // console.log(wordDisplay)
            console.log(wordContent)
            console.log(wordContent.join(" "))
            k.comp.words.main.push(`<div>${wordContent.join(" ")}</div>`)
        }
    }
}
