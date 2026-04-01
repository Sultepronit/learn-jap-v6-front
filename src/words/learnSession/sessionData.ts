import { emit, EVT, on } from "../../global/events"
import { areSameDay, getNow } from "../../helpers/time"
import { getWordById, loadBasicList } from "../data/data"
import type { CombinedWord } from "../types"
import { papareWord } from "./helpers"
import prepareSession from "./preparation"
import update from "./update"

const sessionLenth = 30
async function createSession(sessionLenth: number) {
    const prep = await prepareSession(sessionLenth)
    // session.content = prep.content
    // session.plan.learn = prep.learnNumber
    // session.plan.repeat = prep.repeatNumber
    // session.t = getNow()
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
                bad: 0,
                upgrade: 0
            },
            repeat: {
                good: 0,
                pass: 0,
                retry: 0,
                bad: 0,
                upgrade: 0
            },
            autorepeat: {
                good: 0,
                upgrade: 0
            }
        }
    }
}
// export type WordsSession = typeof session
export type WordsSession = Awaited<ReturnType<typeof createSession>>

let session: WordsSession

const storeSession = () => localStorage.setItem("wordsSession", JSON.stringify(session))
const restoreSession = () => JSON.parse(localStorage.getItem("wordsSession")) as WordsSession

async function continueSession(): Promise<WordsSession> {
    const allWordsPromise = loadBasicList()

    const restored = restoreSession()
    console.log(restored)
    if (!restored) return null
    if (restored.content.length < 1) return null
    // if (!areSameDay(restored.t, getNow()) && restored.stats.tries > 0) return null
    if (!areSameDay(restored.t, getNow())) {
        // if (restored.stats.tries > 0) return null
        // restored.t = getNow()
        return null
    }

    await allWordsPromise

    const newCont: CombinedWord[] = []
    for (const oldWord of restored.content) {
        const word = getWordById(oldWord.id)
        if (oldWord.comp) word.comp = oldWord.comp
        // console.log(word.comp)
        newCont.push(word)
    }
    // console.log(newCont)
    restored.content = newCont

    return restored
}

// improve this shit!
export async function initSession() {
    const restored = await continueSession()
    if (restored) {
        session = restored
    } else {
        // const prep = await prepareSession(sessionLenth)
        // session.content = prep.content
        // session.plan.learn = prep.learnNumber
        // session.plan.repeat = prep.repeatNumber
        // session.t = getNow()
        session = await createSession(sessionLenth)
    }

    getNext()
}

on(EVT.WS.RESET_REQUESTED, async () => (session = await createSession(sessionLenth)))

let word: CombinedWord
export async function getNext() {
    emit(EVT.WS.STATS_UPDATED, session)
    storeSession()

    // if (session.content.length === 0) return
    if (session.content.length === 0) {
        // emit(EVT.WS.NEXT_CARD, null)
        emit(EVT.WS.ENDED)
        return
    }

    word = session.content[session.content.length - 1]
    await papareWord(word)

    console.log(session)
    console.log(word)

    emit(EVT.WS.NEXT_CARD, word)
}

on(EVT.WS.WORD_EVALUATED, mark => {
    update(word, mark, session.stats)

    if (mark === "retry") {
        session.content.unshift(session.content.pop())
    } else {
        session.content.pop()
    }

    getNext()
})
