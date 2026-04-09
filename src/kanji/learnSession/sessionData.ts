import { emit, EVT, on } from "../../global/events"
import { areSameDay, getNow } from "../../helpers/time"
import { loadBasicList as loadBasicWordsList } from "../../words/data/data"
// import { loadBasicList } from "../data/data"
import type { CombinedKanji } from "../types"
import { papareKanji } from "./helpers"
import prepareSession from "./preparation"

const sessionLenth = 30
async function createSession(sessionLenth: number) {
    const prep = await prepareSession(sessionLenth)
    return {
        t: getNow(),
        content: prep.content,
        plan: {
            total: sessionLenth,
            learn: prep.learnNumber,
            repeat: prep.repeatNumber
        },
        stats: {
            tries: 0,
            results: 0,
            learn: {
                good: 0,
                pass: 0,
                retry: 0,
                bad: 0
                // upgrade: 0
            },
            repeat: {
                good: 0,
                pass: 0,
                retry: 0,
                bad: 0
                // upgrade: 0
            },
            autorepeated: prep.autorepeated
        }
    }
}

export type KanjiSession = Awaited<ReturnType<typeof createSession>>

let session: KanjiSession

const storeSession = () => localStorage.setItem("kanjiSession", JSON.stringify(session))
const restoreSession = () => JSON.parse(localStorage.getItem("kanjiSession")) as KanjiSession

// async function continueSession(): Promise<KanjiSession> {
//     const allWordsPromise = loadBasicList()
//     const restored = restoreSession()
//     console.log(restored)
//     if (!restored) return null
//     if (restored.content.length < 1) return null
//     // if (!areSameDay(restored.t, getNow()) && restored.stats.tries > 0) return null
//     if (!areSameDay(restored.t, getNow())) {
//         // if (restored.stats.tries > 0) return null
//         // restored.t = getNow()
//         return null
//     }

//     await allWordsPromise

//     const newCont: CombinedWord[] = []
//     for (const oldWord of restored.content) {
//         // const word = getWordById(oldWord.id)
//         const word = wordsIndex.get(oldWord.id)
//         if (oldWord.comp) word.comp = oldWord.comp
//         // console.log(word.comp)
//         newCont.push(word)
//     }
//     // console.log(newCont)
//     restored.content = newCont

//     return restored
// }

export async function initSession() {
    loadBasicWordsList()
    // const wordsPromise = loadBasicWordsList()
    // await loadAllWords()
    // const restored = await continueSession()
    // if (restored) {
    //     session = restored
    // } else {
    //     session = await createSession(sessionLenth)
    // }
    session = await createSession(sessionLenth)
    // await wordsPromise

    getNext()
}

// on(EVT.WS.RESET_REQUESTED, async () => {
//     session = await createSession(sessionLenth)
//     getNext()
// })

let k: CombinedKanji
export async function getNext() {
    // emit(EVT.WS.STATS_UPDATED, session)
    storeSession()

    if (session.content.length === 0) {
        emit(EVT.WS.ENDED)
        return
    }

    k = session.content[session.content.length - 1]
    await papareKanji(k)

    console.log(session)
    console.log(k)

    emit(EVT.KS.NEXT_CARD, k)
}

on(EVT.KS.EVALUATED, mark => {
    // update(k, mark, session.stats)

    if (mark === "retry") {
        session.content.unshift(session.content.pop())
    } else {
        session.content.pop()
    }

    getNext()
})
