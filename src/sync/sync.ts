import { getIndexed } from "../indexedDB/dbHandlers"
import type { WordCard } from "../words/types"
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
    return Array.from(map.values())
        .map(({ id, v, syncV, data }) => ({ id, v, syncV, data }))
}

// remove export?
export async function sync() {
    const msg = [
        {
            type: "wordCards",
            v: 0,
            updated: prepareToSend(toSync.wordCards)
        },
        {
            type: "wordProgs",
            v: 0,
            // updated: []
        }
    ]

    const apiUrl = import.meta.env.VITE_API_URL
    console.log(apiUrl)

    // const c0 = localStorage.getItem("c0")
    // console.log(JSON.parse(c0))
    const re = await fetch(`${apiUrl}/sync`, {
        method: "POST",
        body: JSON.stringify(msg)
    })
    
    const j = await re.json()
    console.log(j[0])
    implementUpdates(j, toSync)
}

// setInterval(sync, 5000)