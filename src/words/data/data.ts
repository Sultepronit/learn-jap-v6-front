import { emit, EVT, on } from "../../global/events"
import { useDb } from "../../indexedDB/dbHandlers"
import type { CombinedCard, SyncBlock, WordCard } from "../types"

let words: CombinedCard[] = null
let wordsIndex = new Map<number, CombinedCard>()

export function setUpdates({ type, updates }: { type: "wordCards" | "wordProgs", updates: SyncBlock[] }) {
    console.log(type, updates)
    const block = type === "wordCards" ? "card" : "prog"
    for (const u of updates) {
        // const word = words.find(c => c.id === u.id)
        const word = wordsIndex.get(u.id)
        if (!word) continue
        word.v++
        const descriptor = Object.getOwnPropertyDescriptor(word, block)
        // const descriptor = null
        if (!descriptor?.get && word[block] === u) continue
        // console.log(word[block], u)
        // word[block] = u
        Object.defineProperty(word, block, { value: u })
    }
    emit(EVT.WORD_UPDATED)
}

export async function loadData() {
    if (words) return words

    on(EVT.WORD_UPDATES_RECEIVED, setUpdates)

    console.timeLog("t1", "cards init")
    const keys = await useDb("wordCards", "readonly", s => s.getAllKeys()) as number[]
    console.timeLog("t1", "cards keys")

    words = keys.map((id, i) => {
        const word = {
            id,
            num: i + 1,
            v: 0,
            get card() {
                loadCard(this)
                return null
            },
            get prog() {
                loadCard(this)
                return null
            }
        }
        wordsIndex.set(id, word)
        return word
    })
    console.timeLog("t1", "cards parsed")
    // console.log(wordsIndex)
    return words
}

export function getWordById(id: number) {
    return wordsIndex.get(id)
}

// export function getCard(num: number, id: number) {
//     if (num >= 0) {
//         let c = words[num - 1]
//         if (c.id === id) return c
//     }
//     return words.find(c => c.id === id)
// }

let queue = new Set()
let timeout = 0
let isPlanned = false
async function loadCard(word) {
    // console.log(queue.has(card.id))
    // console.log("loading!")
    if (queue.has(word.id)) return
    queue.add(word.id)
    
    Object.defineProperty(word, 'card', {
        value: await useDb("wordCards", "readonly", s => s.get(word.id))
    })
    Object.defineProperty(word, 'prog', {
        value: await useDb("wordProgs", "readonly", s => s.get(word.id))
    })

    word.v++
    queue.delete(word.id)
    // console.log(queue)

    if (timeout) {
        isPlanned = true
        return
    }

    document.dispatchEvent(new Event("word-updated"))
    timeout = setTimeout(() => {
        // console.log("updte!")
        if (isPlanned) {
            isPlanned = false
            document.dispatchEvent(new Event("word-updated"))
        }
        
        clearTimeout(timeout)
        timeout = 0
    }, 10)
}
