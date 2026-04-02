import { getIndexed } from "../../indexedDB/dbHandlers"
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
                // loadCard(this)
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
