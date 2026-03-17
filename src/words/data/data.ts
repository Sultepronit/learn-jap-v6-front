import { emit, EVT, on } from "../../global/events"
import type { SyncCard } from "../../global/types"
import { useDb } from "../../indexedDB/dbHandlers"
import { getAllCards, getCard } from "../../indexedDB/dbUseCases"
import { toSync } from "../../sync/sync"
import type { CombinedCard } from "../types"
import { createWord } from "./creation"

let words: CombinedCard[] = null
let wordsIndex = new Map<number, CombinedCard>()

function setNewWords(newWords: SyncCard[], block: "card" | "prog") {
    console.log(newWords)
    for (const nwb of newWords) {
        const test = wordsIndex.get(nwb.id)
        if (test) { // ALREADY EXISTS!
            console.log("already exists!")
            continue
        }
        console.log(nwb)
        const word = createWord(0, nwb.id)
        word[block] = nwb
        words.push(word)
        wordsIndex.set(word.id, word)
    }
    words.sort((a, b) => a.id - b.id)

    for (let i = words.length - 1; i >= 0; i--) {
        if (words[i].num === i + 1) break
        words[i].num = i + 1
        console.log(words[i])
    }
    emit(EVT.WORDS_COUNT_CHANGED)
}

function setDeleted({ ids }: { ids: number[] }) {
    const indexes = []
    for (const id of ids) {
        const word = wordsIndex.get(id)
        if (!word) continue

        const index = word.num - 1
        indexes.push(index)
        wordsIndex.delete(id)
        words.splice(index, 1)
    }
    
    if (indexes.length < 1) return

    for (let i = Math.min(...indexes); i < words.length; i++) {
        console.log(i, words[i])
        words[i].num = i + 1
    }
    emit(EVT.WORDS_COUNT_CHANGED) // for the view
}

export function setUpdates({ type, updates }: { type: "wordCards" | "wordProgs", updates: SyncCard[] }) {
    console.log(type, updates)
    const block = type === "wordCards" ? "card" : "prog"

    const newWords = []

    for (const u of updates) {
        console.log(u)
        const word = wordsIndex.get(u.id)

        if (!word) { // new
            newWords.push(u)
            continue
        }

        const descriptor = Object.getOwnPropertyDescriptor(word, block)
        if (!descriptor?.get && word[block] === u) continue

        Object.defineProperty(word, block, {
            value: u,
            writable: true,
            configurable: true
        })
        word.v++
    }
    if (newWords.length > 0) {
        setNewWords(newWords, block)
    }

    emit(EVT.WORD_UPDATED)
}

export async function loadBasicList() {
    if (words) return words

    on(EVT.WORD_UPDATES_RECEIVED, setUpdates)
    on(EVT.WORDS_DELETED, setDeleted)

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
    addVoid()
    console.timeLog("t1", "cards parsed")
    // console.log(wordsIndex)
    return words
}

export function getWordById(id: number) {
    return wordsIndex.get(id)
}

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
        value: toSync.wordCards.get(word.id) || await getCard("wordCards", word.id),
        writable: true,
        configurable: true
    })

    Object.defineProperty(word, 'prog', {
        value: toSync.wordProgs.get(word.id) || await getCard("wordProgs", word.id),
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
    const entries = (await getAllCards(type) || []) as SyncCard[]
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

function addVoid() {
    const word = createWord(words.length + 1)
    words.push(word)
}

export function addNew(word: CombinedCard) {
    wordsIndex.set(word.id, word)
    addVoid()
    emit(EVT.WORDS_COUNT_CHANGED)
}

// export function deleteWord(id: number) {
//     const index = wordsIndex.get(id).num - 1
//     wordsIndex.delete(id)
//     console.log(index)
//     words.splice(index, 1)
//     for (let i = index; i < words.length; i++) {
//         // console.log(i, words[i])
//         words[i].num = i + 1
//     }
//     emit(EVT.WORDS_COUNT_CHANGED) // for the view

//     // deletedWords.add(id)
// }