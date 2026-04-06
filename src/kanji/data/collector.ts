import { emit, EVT } from "../../global/events"
import { areArraysEqual } from "../../helpers/array"
import { getUniqueKanji } from "../../helpers/text"
import { loadAll as loadAllWords, loadBasicList as loadBasicWordsList } from "../../words/data/data"
import type { KanjiProg } from "../types"
import { loadAllProgs, loadBasicList } from "./data"

export default async function collectKanji() {
    const words = await loadBasicWordsList()
    const kanjiPromise = loadBasicList()
    // await loadAllWords("wordCards")
    // await loadAllWords("wordProgs")
    await Promise.all([loadAllWords("wordCards"), loadAllWords("wordProgs")])
    console.log(words)
    // const testBlock = words.slice(0, 100)

    const mainLinks = new Map<String, number[]>()
    const otherLinks = new Map<String, number[]>()
    // for (const w of testBlock) {
    for (const w of words) {
        // if (w.prog.data.status === -0.5) continue
        if (w.prog.data.status === -1) break
        // console.log(w.id)
        // console.log(w.card.data.writings)
        const writ = w.card.data.writings
        // const main = writ.alt ? "" : writ.main.join("")
        let mainBulk = ""
        let otherBulk = ""
        if (!writ.alt) {
            mainBulk = writ.main.join("")
        } else {
            otherBulk = writ.main.join("")
        }
        if (writ.rare) otherBulk += writ.rare.join("")

        const main = mainBulk ? getUniqueKanji(mainBulk) : []
        let other = otherBulk ? getUniqueKanji(otherBulk) : []
        other = other.filter(o => !main.includes(o))

        addLinks(main, mainLinks, w.id)
        addLinks(other, otherLinks, w.id)
    }
    console.log(mainLinks)
    console.log(otherLinks)

    const kanji = await kanjiPromise
    await loadAllProgs()

    const mutatedProgs: KanjiProg[] = []
    console.log(kanji)
    for (const k of kanji) {
        const kl = k.card.data.links

        const ml = mainLinks.get(k.id)
        if (!ml) {
            if (kl.main.length > 0) {
                k.v++
                kl.main = []
                if (k.card.data.readings) {
                    console.log("updated(-):", k)
                } else {
                    k.prog.data.status = -2
                    mutatedProgs.push(k.prog)
                    console.log("degraded:", k)
                }
            }
        } else {
            if (!areArraysEqual(kl.main, ml)) {
                k.v++
                kl.main = ml
                if (k.prog.data.status === -1 || k.prog.data.status === -2) {
                    k.prog.data.status = 0
                    mutatedProgs.push(k.prog)
                    console.log("upgraded:", k)
                } else {
                    // console.log("updated:", k)
                }
            }
            mainLinks.delete(k.id)
        }

        const ol = otherLinks.get(k.id)
        if (!ol) {
            if (kl.other) {
                k.v++
                // console.log("updated(-):", k)
                delete kl.other
            }
        } else {
            if (!areArraysEqual(kl.main, ol)) {
                k.v++
                kl.other = ol
                // console.log("updated:", k)
            }
        }
    }
    console.log("new:", mainLinks)
    emit(EVT.KANJI_UPDATED)
    if (mutatedProgs.length > 0) {
        emit(EVT.CARDS_MUTATED, { type: "kanjiProgs", cards: mutatedProgs })
    }
}

function addLinks(nextPart: string[], map: Map<String, number[]>, wordId: number) {
    for (const k of nextPart) {
        const list = map.get(k)
        if (list) {
            list.push(wordId)
        } else {
            map.set(k, [wordId])
        }
    }
}
