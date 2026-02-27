import { useDb } from "../../indexedDB/dbHandlers"
import type { CombinedCard, WordCard } from "../types"

let cards: CombinedCard[] = null
let cardV = 1

export async function loadData() {
    if (cards) return cards

    console.timeLog("t1", "cards init")
    const keys = await useDb("wordCards", "readonly", s => s.getAllKeys()) as number[]
    console.timeLog("t1", "cards keys")
    // cards = keys.map((id, i) => ({ id, num: i + 1, v: 0 }))
    cards = keys.map((id, i) => ({
        id,
        num: i + 1,
        v: 0,
        get card() {
            loadCard(this)
            return null
        }
    }))
    console.timeLog("t1", "cards parsed")
    console.log(cards)
    return cards
}

// export function getCards() {
//     return cards
// }

let queue = new Set()
let timeout = 0
let isPlanned = false
async function loadCard(card) {
    // console.log(queue.has(card.id))
    if (queue.has(card.id)) return
    queue.add(card.id)
    
    // card.card = await useDb("wordCards", "readonly", s => s.get(card.id)) as WordCard
    Object.defineProperty(card, 'card', {
        value: await useDb("wordCards", "readonly", s => s.get(card.id)) as WordCard
    })
    card.v = cardV++
    queue.delete(card.id)
    // console.log(queue)

    if (timeout) {
        isPlanned = true
        return
    }

    document.dispatchEvent(new Event("word-updated"))
    timeout = setTimeout(() => {
        if (isPlanned) {
            isPlanned = false
            document.dispatchEvent(new Event("word-updated"))
        }
        
        clearTimeout(timeout)
        console.log(timeout)
        timeout = 0
        console.log(timeout)
    }, 50)
    console.log(timeout)
}
