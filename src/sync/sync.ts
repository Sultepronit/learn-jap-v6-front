import { getIndexed } from "../indexedDB/dbHandlers"
import type { WordCard } from "../words/types"
import globalVersions from "./globalVersions"
import { implementUpdates } from "./remoteMutaions"

export const toSync = {
    wordCards: new Map()
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

// remove export?
export async function sync() {
    const wc = prepareToSend(toSync.wordCards)
    const msg = [
        {
            type: "wordCards",
            v: globalVersions.get("wordCards"),
            ...(wc && { updated: wc })
        },
        {
            type: "wordProgs",
            v: 0,
            // updated: []
        }
    ]
    console.log("sent:", msg)

    const apiUrl = import.meta.env.VITE_API_URL
    console.log(apiUrl)

    // const c0 = localStorage.getItem("c0")
    // console.log(JSON.parse(c0))
    const re = await fetch(`${apiUrl}/sync`, {
        method: "POST",
        body: JSON.stringify(msg)
    })
    
    const j = await re.json()
    console.log("received:", j)
    implementUpdates(j, toSync)
}

// setInterval(sync, 5000)