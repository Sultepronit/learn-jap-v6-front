import { emit, EVT, on } from "../global/events"
import { getIndexed } from "../indexedDB/dbHandlers"
import type { SyncBlock } from "../words/types"
import globalVersions from "./globalVersions"
import { implementUpdates } from "./remoteMutations"

export const toSync = {
    wordCards: new Map(),
    wordProgs: new Map()
}

async function checkUnsaved() {
    for (const [type, map] of Object.entries(toSync)) {
        const blocks = await getIndexed(type, "toSync") as SyncBlock[]
        for (const b of blocks) {
            map.set(b.id, b)
        }
    }
    console.log(toSync)
    sync();
}

checkUnsaved()

function prepareMsg() {
    const msg = []
    for (const [type, map] of Object.entries(toSync)) {
        const updated = map.size === 0 ? null : Array.from(map.values())
            .map(({ id, v, syncV, data }) => ({ id, v, syncV, data }))

        console.log(updated)
        msg.push({
            type,
            v: globalVersions.get(type),
            ...(updated && { updated })
        })
    }
    console.log("sent:")
    console.table(msg)

    return JSON.stringify(msg)
}

async function sync() {
    const msg = prepareMsg()
    communicate(msg) 
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
        console.log("received:")
        console.table(r)
        implementUpdates(r, toSync)

        emit(EVT.SYNC_STATUS_CHANGED, "")
        disconnected = false
    } catch (error) {
        emit(EVT.SYNC_STATUS_CHANGED, "disconnected")
        disconnected = true
    } finally {
        emit(EVT.CONNECTION_STATUS_UPDATED, "")
    }
}

let time = 0
let pending = false
function planSync() {
    pending = true
    emit(EVT.SYNC_STATUS_CHANGED, "stale")
}
on(EVT.CARD_MUTATED, planSync)
on(EVT.UPDATE_NOT_ENDED, planSync)

function syncWithControl() {
    sync()
    time = 0
    pending = false
    window.removeEventListener("click", syncWithControl)
}

setInterval(() => {
    time++
    if (pending || disconnected) {
        syncWithControl()
    } else if (time === 3) {
        emit(EVT.SYNC_STATUS_CHANGED, "stale")
        window.addEventListener("click", syncWithControl, { once: true })
    }
    // console.log(time)
}, 2_000)