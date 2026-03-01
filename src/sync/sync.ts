import { getIndexed } from "../indexedDB/dbHandlers"
import type { WordCard } from "../words/types"

// export const toSync = new Set()
export const toSync = {
    // wordCards: new Set()
    wordCards: null as Set<WordCard>,
    // wordCards2: null as Map<number, WordCard>
    wordCards2: new Map()
}

async function checkUnsaved() {
    const wc = await getIndexed("wordCards", "toSync") as WordCard[]
    console.log(wc)
    console.timeLog("t1", "indexes!")
    // toSync.wordCards2 = new Map()
    toSync.wordCards = new Set(wc)
    for (const c of wc) {
        toSync.wordCards2.set(c.id, c)
    }
    console.log(toSync)
    sync();
}

checkUnsaved()

function prepareToSend(set: Set<WordCard>) {
    return Array.from(set).map(({ id, v, syncV, data }) => ({ id, v, syncV, data }))
}

function prepareToSend2(map: Map<number, WordCard>) {
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
            // wordCards: prepareToSend(toSync.wordCards)
            wordCards: prepareToSend2(toSync.wordCards2)
        }
    }
    console.log(msg)
    console.log(JSON.stringify(msg))
}