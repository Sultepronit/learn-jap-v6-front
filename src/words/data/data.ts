import { emit, EVT, on } from "../../global/events"
import type { SyncWord } from "../../global/types"
import { defineProperty, isGetter } from "../../helpers/object"
import { useDb } from "../../indexedDB/dbHandlers"
import { getAllCards, getCard } from "../../indexedDB/dbUseCases"
import { toSync } from "../../sync/sync"
import type { CombinedWord } from "../types"
import { createWord, createWordProg } from "./creation"

let words: CombinedWord[] = null
export const wordsIndex = new Map<number, CombinedWord>()

export async function loadBasicList() {
    if (words) return words

    on(EVT.WORD_UPDATES_RECEIVED, setUpdates)
    on(EVT.WORDS_DELETED, setDeleted)

    console.timeLog("t1", "cards init")
    const keys = (await useDb("wordCards", "readonly", s => s.getAllKeys())) as number[]
    console.timeLog("t1", "cards keys")
    // console.log(keys)

    words = keys.map((id, i) => {
        const word = {
            id,
            num: i + 1,
            v: 0,
            get card() {
                delete this.card
                loadCard(this)
                return null
            },
            get prog() {
                delete this.prog
                loadCard(this)
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

// export function getWordById(id: number) {
//     return wordsIndex.get(id)
// }

let queue = new Set()
let timeout = 0
let isPlanned = false
async function loadCard(word: CombinedWord) {
    // console.log(queue.has(word.id))
    // console.log("loading!")
    if (queue.has(word.id)) return
    queue.add(word.id)
    // console.log(queue)

    // console.time("get1")
    for (const block of ["card", "prog"]) {
        if (word[block]) continue
        const type = block === "card" ? "wordCards" : "wordProgs"

        const val =
            toSync[type].get(word.id) ||
            (await getCard(type, word.id)) ||
            recreateBlock(word, block)
        defineProperty(word, block, val)
    }
    // console.timeLog("t1", "loaded!")

    word.v++
    queue.delete(word.id)

    if (timeout) {
        isPlanned = true
        return
    }

    // for this result:
    emit(EVT.WORD_UPDATED)

    // for next results:
    timeout = setTimeout(() => {
        if (isPlanned) {
            isPlanned = false
            emit(EVT.WORD_UPDATED)
        }

        clearTimeout(timeout)
        timeout = 0
    }, 50)
}

const loaded = {}
export async function loadAll(type: "wordCards" | "wordProgs") {
    if (loaded[type]) return

    console.timeLog("t1", "start")
    const entries = ((await getAllCards(type)) || []) as SyncWord[]
    // console.log(re)
    console.timeLog("t1", "parsing")
    const block = type === "wordCards" ? "card" : "prog"
    for (const e of entries) {
        const word = wordsIndex.get(e.id)
        // if (!word) continue // what the heck???

        if (!isGetter(word, block) && word[block]) continue
        word.v++

        defineProperty(word, block, e)
    }

    loaded[type] = true
    console.timeLog("t1", "end")
    emit(EVT.WORD_UPDATED)
}

function setNewWords(newWords: SyncWord[], block: "card" | "prog") {
    console.log(newWords)
    for (const nwb of newWords) {
        const test = wordsIndex.get(nwb.id)
        if (test) {
            // ALREADY EXISTS!
            console.log("already exists!")
            continue
        }
        // console.log(nwb)
        const word = createWord(0, nwb.id)
        word[block] = nwb
        words.push(word)
        wordsIndex.set(word.id, word)
    }
    words.sort((a, b) => a.id - b.id)

    for (let i = words.length - 1; i >= 0; i--) {
        if (words[i].num === i + 1) break
        words[i].num = i + 1
        // console.log(words[i])
    }
    emit(EVT.WORDS_COUNT_CHANGED)
}

function setDeleted(ids: number[]) {
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

type Update = {
    type: "wordCards" | "wordProgs"
    updates: SyncWord[]
}
export function setUpdates({ type, updates }: Update) {
    console.log(type, updates)
    const block = type === "wordCards" ? "card" : "prog"

    const newWords = []

    for (const u of updates) {
        // console.log(u)
        const word = wordsIndex.get(u.id)

        if (!word) {
            newWords.push(u)
            continue
        }

        if (!isGetter(word, block) && word[block] === u) continue

        defineProperty(word, block, u)
        word.v++
    }
    if (newWords.length > 0) {
        setNewWords(newWords, block)
    }

    emit(EVT.WORD_UPDATED)
}

function addVoid() {
    const word = createWord(words.length + 1)
    words.push(word)
}

export function addNew(word: CombinedWord) {
    wordsIndex.set(word.id, word)
    addVoid()
    emit(EVT.WORDS_COUNT_CHANGED)
}

function recreateBlock(word: CombinedWord, block: string) {
    console.log("recreate!", block, word.id)
    if (block === "card") {
        alert(`Code: 123! No word card with id: ${word.id}`)
        return
    }

    const prog = createWordProg(word.id)
    emit(EVT.CARD_MUTATED, { type: "wordProgs", card: prog })
    return prog
}
