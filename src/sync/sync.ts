import { emit, EVT, on } from "../global/events"
import { getIndexed } from "../indexedDB/dbHandlers"
import type { WordCard } from "../words/types"
import globalVersions from "./globalVersions"
import { implementUpdates } from "./remoteMutaions"

export const toSync = {
    wordCards: new Map(),
    wordProgs: new Map()
}

async function checkUnsaved() {
    const wc = await getIndexed("wordCards", "toSync") as WordCard[]
    console.log(wc)
    console.timeLog("t1", "indexes!")
    for (const c of wc) {
        toSync.wordCards.set(c.id, c)
    }
    console.log(toSync)
    sync();
}

checkUnsaved()

function prepareToSend(map: Map<number, WordCard>) {
    return map.size === 0 ? null : Array.from(map.values())
        .map(({ id, v, syncV, data }) => ({ id, v, syncV, data }))
}

const apiUrl = import.meta.env.VITE_API_URL

let disconnected = false

async function sync() {
    const wc = prepareToSend(toSync.wordCards)
    const wp = prepareToSend(toSync.wordProgs)
    const msg = [
        {
            type: "wordCards",
            v: globalVersions.get("wordCards"),
            ...(wc && { updated: wc })
        },
        {
            type: "wordProgs",
            v: globalVersions.get("wordProgs"),
            ...(wp && { updated: wp })
        }
    ]
    // console.log("sent:", msg)
    console.log("sent:")
    console.table(msg)

    try {
        emit(EVT.CONNECTION_STATUS_UPDATED, "pending")

        const j = await fetch(`${apiUrl}/sync`, {
            method: "POST",
            body: JSON.stringify(msg)
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
}, 5_000)