import { emit, EVT, on } from "../../global/events"
import { genRandomInt, randomize } from "../../helpers/random"
import { getCardsStatusRange } from "../../indexedDB/dbUseCases"
import globalVersions from "../../sync/globalVersions"
import { getWordById, loadBasicList, setUpdates } from "../data/data"
import type { CombinedWord, WordProg } from "../types"
import { detectDirection, papareWord } from "./helpers"
import prepareSession from "./preparation"
import update from "./update"

const sessionLenth = 50
let session = {
    t: 0,
    v: 0,
    content: null as CombinedWord[],
    plan: {
        total: sessionLenth,
        learn: 0,
        repeat: 0
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

export type WordsSession = typeof session

const storeSession = () => localStorage.setItem("wordsSession", JSON.stringify(session))
const restoreSession = () => JSON.parse(localStorage.getItem("wordsSession")) as WordsSession

async function continueSession(): Promise<WordsSession> {
    const allWordsPromise = loadBasicList()

    const restored = restoreSession()
    console.log(restored)
    if (!restored) return null
    if (restored.content.length < 1) return null
    if (
        new Date(restored.t).toDateString() !== new Date().toDateString() &&
        restored.stats.tries > 0
    ) {
        return null
    }

    await allWordsPromise

    const newCont: CombinedWord[] = []
    for (const oldWord of restored.content) {
        const word = getWordById(oldWord.id)
        if (oldWord.comp) word.comp = oldWord.comp
        console.log(word.comp)
        newCont.push(word)
    }
    console.log(newCont)
    restored.content = newCont

    return restored
}

export async function initSession() {
    const restored = await continueSession()
    if (restored) {
        session = restored
    } else {
        const prep = await prepareSession(sessionLenth)
        session.content = prep.content
        session.plan.learn = prep.learnNumber
        session.plan.repeat = prep.repeatNumber
        session.t = Date.now()
        session.v = globalVersions.get("wordProgs")
    }

    getNext()
}

let word: CombinedWord
export async function getNext() {
    emit(EVT.WS.STATS_UPDATED, session)

    if (session.content.length === 0) return

    word = session.content[session.content.length - 1]
    await papareWord(word)

    session.v = globalVersions.get("wordProgs")
    storeSession()

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
