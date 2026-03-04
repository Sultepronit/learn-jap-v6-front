import { getIndexed } from "../indexedDB/dbHandlers"
import type { WordCard } from "../words/types"

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

async function sync() {
    const msg = {
        v: {
            wordCards: 0,
            wordProgs: 0
        },
        updates: {
            wordCards: prepareToSend(toSync.wordCards)
        }
    }
    console.log(msg)
    console.log(JSON.stringify(msg))

    const apiUrl = import.meta.env.VITE_API_URL
    console.log(apiUrl)

    // const c0 = localStorage.getItem("c0")
    // console.log(JSON.parse(c0))
    const re = await fetch(`${apiUrl}/sync`, {
        method: "POST",
        body: JSON.stringify(msg.updates.wordCards)
    })
    
    const j = await re.json()
    console.log(j)
}

// setInterval(sync, 5000)