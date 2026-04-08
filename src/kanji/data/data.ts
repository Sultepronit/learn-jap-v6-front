import { emit, EVT, on } from "../../global/events"
import type { SyncKanji } from "../../global/types"
import { defineProperty, isGetter } from "../../helpers/object"
import { getIndexed } from "../../indexedDB/dbHandlers"
import { getAllCards, getCard } from "../../indexedDB/dbUseCases"
import { toSync } from "../../sync/sync"
import type { CombinedKanji, KanjiCard, KanjiProg } from "../types"
import { createKanji } from "./creation"

let kanji: CombinedKanji[]
const kanjiIndex = new Map<string, CombinedKanji>()

export async function loadBasicList() {
    if (kanji) return kanji

    on(EVT.KANJI_UPDATES_RECEIVED, setUpdates)

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
        kanjiIndex.set(card.id, k)
        return k
    })

    console.timeLog("t1", "cards parsed")
    // console.log(kanjiIndex)
    // console.log(kanji)
    return kanji
}

let queue = new Set()
let timeout = 0
let isPlanned = false
async function loadCard(k: CombinedKanji) {
    // console.log(queue.has(k.id))
    // console.log("loading!")
    if (queue.has(k.id)) return
    queue.add(k.id)
    // console.log(queue)
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

let loaded = false
export async function loadAllProgs() {
    if (loaded) return

    console.timeLog("t1", "start")
    const entries = ((await getAllCards("kanjiProgs")) || []) as KanjiProg[]
    // console.log(entries)
    console.timeLog("t1", "parsing")

    for (const e of entries) {
        const k = kanjiIndex.get(e.id as string)

        if (!isGetter(k, "prog") && k.prog) continue
        k.v++

        defineProperty(k, "prog", e)
    }

    loaded = true
    console.timeLog("t1", "end")
    emit(EVT.KANJI_UPDATED)
}

function setNewKanji(newKanji: SyncKanji[], block: "card" | "prog") {
    console.log(newKanji)
    for (const nkb of newKanji) {
        const test = kanjiIndex.get(nkb.id)
        if (test) {
            console.log("already exists!")
            continue
        }

        const k = createKanji(kanji.length + 1, nkb.id)
        k[block] = nkb
        kanji.push(k)
        kanjiIndex.set(k.id, k)
    }
    kanji.sort((a, b) => a.card.data.order - b.card.data.order)

    for (let i = kanji.length - 1; i >= 0; i--) {
        if (kanji[i].num === i + 1) break
        kanji[i].num = i + 1
    }
    emit(EVT.KANJI_COUNT_CHANGED)
}

type Update = {
    type: "kanjiCards" | "kanjiProgs"
    updates: SyncKanji[]
}
export function setUpdates({ type, updates }: Update) {
    console.log(type, updates)
    const block = type === "kanjiCards" ? "card" : "prog"

    const newKanji = []

    for (const u of updates) {
        // console.log(u)
        const k = kanjiIndex.get(u.id)

        if (!k) {
            newKanji.push(u)
            continue
        }

        if (!isGetter(k, block) && k[block] === u) continue

        defineProperty(k, block, u)
        k.v++
    }
    if (newKanji.length > 0) {
        setNewKanji(newKanji, block)
    }

    emit(EVT.KANJI_UPDATED)
}
