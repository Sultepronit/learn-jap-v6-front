import { EVT, emit, on } from "../global/events"
import type { Message, SyncCard } from "../global/types"
import { getIndexed } from "../indexedDB/dbHandlers"
import { deletedWords } from "./deleteWords"
import versions from "./versions"
import { implementUpdates } from "./remoteMutations"
import syncParams from "../global/syncParams"

export const toSync = {
    wordCards: new Map(),
    wordProgs: new Map(),
    kanjiCards: new Map(),
    kanjiProgs: new Map()
}

async function checkUnsaved() {
    if (!syncParams.turnedOn) return

    for (const [type, map] of Object.entries(toSync)) {
        const blocks = (await getIndexed(type, "toSync")) as SyncCard[]
        for (const b of blocks) {
            map.set(b.id, b)
        }
    }
    // console.log(toSync)
    sync()
}

checkUnsaved()

function prepareMsg() {
    const standard = []
    for (const [type, map] of Object.entries(toSync)) {
        const updated =
            map.size === 0
                ? null
                : Array.from(map.values()).map(({ id, v, syncV, data }) => ({
                      id,
                      v,
                      syncV,
                      data
                  }))

        // console.log(updated)
        standard.push({
            type,
            v: versions.get(type as "wordCards" | "wordProgs"),
            ...(updated && { updated })
        })
    }

    const msg: Message = {
        standard,
        ...(deletedWords.value && { deletedWords: deletedWords.value })
    }
    console.log("sent:")
    console.log(msg)
    // console.table(standard)

    // return JSON.stringify(standard)
    return JSON.stringify(msg)
}

async function sync() {
    const msg = prepareMsg()
    const r = await communicate(msg)
    console.log("received:")
    if (!r?.standard) {
        console.log(r)
    } else {
        console.log(...(r.standard as any[]))
    }

    implementUpdates(r?.standard, toSync)
}

on(EVT.SYNC_REQUESTED, sync)

// const apiUrl = import.meta.env.VITE_API_URL
// let apiUrl = localStorage.getItem("api")
let apiUrl = import.meta.env.VITE_API_URL || localStorage.getItem("api")

on(EVT.LOGIN, suggestion => {
    apiUrl = suggestion
    sync()
})

let pending = false
let planned = false
let disconnected = false
async function communicate(msg: string) {
    if (pending) return
    pending = true
    emit(EVT.CONNECTION_STATUS_CHANGED, "pending")

    try {
        const j = await fetch(`${apiUrl}/sync`, {
            method: "POST",
            body: msg
        })

        const r = await j.json()

        if (!planned) {
            emit(EVT.SYNC_STATUS_CHANGED, "fulfilled")
        } else if (disconnected) {
            emit(EVT.SYNC_STATUS_CHANGED, "stale")
        }

        disconnected = false

        return r
    } catch (error) {
        emit(EVT.CONNECTION_STATUS_CHANGED, "failed")
        emit(EVT.SYNC_STATUS_CHANGED, "disconnected")
        disconnected = true
    } finally {
        pending = false
        setTimeout(() => emit(EVT.CONNECTION_STATUS_CHANGED, ""), 200)
    }
}

function planSync() {
    planned = true
    if (!disconnected) emit(EVT.SYNC_STATUS_CHANGED, "stale")
}
on(EVT.CARD_MUTATED, planSync)
on(EVT.WORD_DELETE_INIT, planSync)
on(EVT.UPDATE_NOT_ENDED, planSync)

let time = 0
function syncWithControl() {
    setTimeout(() => {
        sync()
        time = 0
        planned = false
        window.removeEventListener("click", syncWithControl)
    }, 100)
}

setInterval(() => {
    if (!syncParams.turnedOn) return

    time += 5
    if (time < syncParams.timeout) return

    if (planned || disconnected) {
        syncWithControl()
    } else if (time === syncParams.timeout * 3) {
        emit(EVT.SYNC_STATUS_CHANGED, "stale")
        window.addEventListener("click", syncWithControl, { once: true })
    }
}, 5000)
