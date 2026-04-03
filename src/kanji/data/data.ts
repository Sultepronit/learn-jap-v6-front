import { emit, EVT } from "../../global/events"
import { defineProperty } from "../../helpers/object"
import { getIndexed } from "../../indexedDB/dbHandlers"
import { getCard } from "../../indexedDB/dbUseCases"
import { toSync } from "../../sync/sync"
import type { CombinedKanji, KanjiCard } from "../types"

let kanji: CombinedKanji[]

export async function loadBasicList() {
    if (kanji) return kanji

    // on(EVT.WORD_UPDATES_RECEIVED, setUpdates)

    console.timeLog("t1", "cards init")
    const cards = (await getIndexed("kanjiCards", "order")) as KanjiCard[]
    console.timeLog("t1", "cards keys")
    console.log(cards)

    kanji = cards.map((card, i) => {
        const k = {
            id: card.id,
            num: i + 1,
            v: 0,
            card,
            get prog() {
                delete this.prog
                loadCard(this)
                return null
            }
        }
        // wordsIndex.set(id, k)
        return k
    })

    console.timeLog("t1", "cards parsed")
    // console.log(wordsIndex)
    console.log(kanji)
    return kanji
}

let queue = new Set()
let timeout = 0
let isPlanned = false
async function loadCard(k: CombinedKanji) {
    console.log(queue.has(k.id))
    console.log("loading!")
    if (queue.has(k.id)) return
    queue.add(k.id)
    console.log(queue)
    const val = toSync.kanjiProgs.get(k.id) || (await getCard("kanjiProgs", k.id)) // || recreateBlock(k, block)
    defineProperty(k, "prog", val)

    k.v++
    queue.delete(k.id)

    if (timeout) {
        isPlanned = true
        return
    }

    // for this result:
    emit(EVT.KANJI_UPDATED)

    // for next results:
    timeout = setTimeout(() => {
        if (isPlanned) {
            isPlanned = false
            emit(EVT.KANJI_UPDATED)
        }

        clearTimeout(timeout)
        timeout = 0
    }, 50)
}
