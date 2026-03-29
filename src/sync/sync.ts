import { EVT, emit, on } from "../global/events"
import type { Message, SyncCard } from "../global/types"
import { getIndexed } from "../indexedDB/dbHandlers"
import { deletedWords } from "./deleteWords"
import globalVersions from "./globalVersions"
import { implementUpdates } from "./remoteMutations"

export const toSync = {
    wordCards: new Map(),
    wordProgs: new Map()
}

async function checkUnsaved() {
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
            v: globalVersions.get(type as "wordCards" | "wordProgs"),
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
    // console.table(r)
    implementUpdates(r?.standard, toSync)
}

const apiUrl = import.meta.env.VITE_API_URL
let disconnected = false
async function communicate(msg) {
    try {
        emit(EVT.CONNECTION_STATUS_UPDATED, "pending")

        const j = await fetch(`${apiUrl}/sync`, {
            method: "POST",
            body: msg
        })

        const r = await j.json()

        emit(EVT.SYNC_STATUS_CHANGED, "")
        disconnected = false

        return r
    } catch (error) {
        emit(EVT.SYNC_STATUS_CHANGED, "disconnected")
        disconnected = true
    } finally {
        emit(EVT.CONNECTION_STATUS_UPDATED, "")
    }
}

let time = 0
let planned = false
function planSync() {
    planned = true
    emit(EVT.SYNC_STATUS_CHANGED, "stale")
}
on(EVT.CARD_MUTATED, planSync)
on(EVT.WORD_DELETE_INIT, planSync)
on(EVT.UPDATE_NOT_ENDED, planSync)

function syncWithControl() {
    setTimeout(() => {
        sync()
        time = 0
        planned = false
        window.removeEventListener("click", syncWithControl)
    }, 100)
}

setInterval(() => {
    time++
    if (planned || disconnected) {
        syncWithControl()
    } else if (time === 3) {
        emit(EVT.SYNC_STATUS_CHANGED, "stale")
        window.addEventListener("click", syncWithControl, { once: true })
    }
    // console.log(time)
}, 10_000)
