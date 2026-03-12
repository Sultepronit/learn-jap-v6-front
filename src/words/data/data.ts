import { emit, EVT, on } from "../../global/events"
import { useDb } from "../../indexedDB/dbHandlers"
import { getAllCards } from "../../indexedDB/dbUseCases"
import type { CombinedCard, SyncBlock, WordCard, WordProg } from "../types"

let words: CombinedCard[] = null
let wordsIndex = new Map<number, CombinedCard>()

export function setUpdates({ type, updates }: { type: "wordCards" | "wordProgs", updates: SyncBlock[] }) {
    console.log(type, updates)
    const block = type === "wordCards" ? "card" : "prog"
    for (const u of updates) {
        const word = wordsIndex.get(u.id)
        if (!word) continue

        const descriptor = Object.getOwnPropertyDescriptor(word, block)
        if (!descriptor?.get && word[block] === u) continue

        Object.defineProperty(word, block, {
            value: u,
            writable: true,
            configurable: true
        })
        word.v++
    }
    emit(EVT.WORD_UPDATED)
}

export async function loadBasicList() {
    if (words) return words

    on(EVT.WORD_UPDATES_RECEIVED, setUpdates)

    console.timeLog("t1", "cards init")
    const keys = await useDb("wordCards", "readonly", s => s.getAllKeys()) as number[]
    console.timeLog("t1", "cards keys")
    // console.log(keys)

    words = keys.map((id, i) => {
        const word = {
            id,
            num: i + 1,
            v: 0,
            get card() {
                loadCard(this)
                delete this.card
                return null
            },
            get prog() {
                loadCard(this)
                delete this.prog
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
async function loadCard(word: CombinedCard) {
    // console.log(queue.has(word.id))
    // console.log("loading!")
    if (queue.has(word.id)) return
    queue.add(word.id)
    
    // console.time("get1")
    Object.defineProperty(word, 'card', {
        value: await useDb("wordCards", "readonly", s => s.get(word.id)),
        writable: true,
        configurable: true
    })

    Object.defineProperty(word, 'prog', {
        value: await useDb("wordProgs", "readonly", s => s.get(word.id)),
        writable: true,
        configurable: true
    })
    // console.timeEnd("get1")

    word.v++
    queue.delete(word.id)

    if (timeout) {
        isPlanned = true
        return
    }

    // for this result:
    document.dispatchEvent(new Event("word-updated"))
    
    // for next results:
    timeout = setTimeout(() => {
        if (isPlanned) {
            isPlanned = false
            document.dispatchEvent(new Event("word-updated"))
        }
        
        clearTimeout(timeout)
        timeout = 0
    }, 50)
}

const loaded = {}
export async function loadAll(type: "wordCards" | "wordProgs") {
    if (loaded[type]) return

    console.timeLog("t1", "start")
    const entries = (await getAllCards(type) || []) as SyncBlock[]
    // console.log(re)
    console.timeLog("t1", "parsing")
    const block = type === "wordCards" ? "card" : "prog"
    for (const e of entries) {
        const word = wordsIndex.get(e.id)
        if (!word) continue

        const descriptor = Object.getOwnPropertyDescriptor(word, block)
        if (!descriptor?.get && word[block]) continue
        word.v++

        Object.defineProperty(word, block, { value: e })
    }

    loaded[type] = true
    console.timeLog("t1", "end")
    emit(EVT.WORD_UPDATED)
}