import { genRandomInt, randomize } from "../../helpers/random"
import { areSameDay, getNow } from "../../helpers/time"
import { getSessionCards } from "../../indexedDB/dbHandlers"
import { getCardsStatusRange } from "../../indexedDB/dbUseCases"
import { getWordById, loadBasicList, setUpdates } from "../data/data"
import type { CombinedWord, WordProg } from "../types"
import { detectDirection } from "./helpers"

const d10 = 10 * 24 * 60 * 60
function prepareRepeatList(all: WordProg[], length: number) {
    const tLimit = getNow() - d10
    // console.log(new Date(tLimit * 1000))
    const re: WordProg[] = []
    let normal = 0
    for (let i = 0; i < 1000; i++) {
        const ri = genRandomInt(all.length)
        const wProg = all[ri]
        if (!wProg) continue
        console.log(wProg.data.t)
        if (wProg.data.t > tLimit) continue

        re.push(wProg)
        all[ri] = null
        const d = detectDirection(wProg)
        if (!wProg.data[d].autorepeat) normal++
        if (normal >= length) break
    }
    return re
}

function prepareLearnList(range: WordProg[], learnIdx: number, repeatIdx: number) {
    if (repeatIdx === 0) return []

    const now = getNow()

    const returnList = range.slice(0, learnIdx)

    // const learnList = candidates.slice(0, splitInex).filter(c => !areSameDay(c.data.t, now))
    const learnList = range.slice(learnIdx, repeatIdx).filter(c => {
        const re = areSameDay(c.data.t, now)
        if (re) console.log(new Date(c.data.t * 1000))
        return !re
    })

    const tLimit = now - d10
    for (let i = 0; i < returnList.length / 20; i++) {
        const ri = genRandomInt(returnList.length)
        const wProg = returnList[ri]
        if (!wProg) continue
        if (wProg.data.t > tLimit) continue
        console.log("returned:", wProg)
        wProg.data.status = 0
        learnList.push(wProg)
        returnList[ri] = null
    }

    return learnList
}

function prepareSessionList(candidates: WordProg[], sessionLenth: number) {
    // const now = getNow()
    // const splitInex = candidates.findIndex(e => e.data.status > 0)
    // if (splitInex < 0) return

    // // const learnList = candidates.slice(0, splitInex).filter(c => !areSameDay(c.data.t, now))
    // const learnList = candidates.slice(0, splitInex).filter(c => {
    //     const re = areSameDay(c.data.t, now)
    //     if (re) console.log(new Date(c.data.t * 1000))
    //     return !re
    // })
    // const allToRepeat = candidates.slice(splitInex)
    // console.log(learnList, allToRepeat)

    let learnIdx = -1,
        repeatIdx = -1
    for (let i = 0; i < candidates.length; i++) {
        if (learnIdx < 0 && candidates[i].data.status === 0) learnIdx = i
        if (candidates[i].data.status > 0) {
            repeatIdx = i
            break
        }
    }
    console.log(learnIdx, repeatIdx)

    const learnList = prepareLearnList(candidates, learnIdx, repeatIdx)
    const allToRepeat = candidates.slice(repeatIdx)
    console.log(learnList, allToRepeat)

    const repeatNumber = sessionLenth - learnList.length
    const repeatList = prepareRepeatList(allToRepeat, repeatNumber)

    const list = [...learnList, ...repeatList]
    randomize(list)
    // console.log(list)

    return {
        learnNumber: learnList.length,
        repeatNumber,
        list
    }
}

export default async function prepareSession(length: number) {
    // const maxToRepeat = 9000
    // const maxToRepeat = 8100

    console.timeLog("t1", "range init")
    // const range = (await getCardsStatusRange("wordProgs", 0, maxToRepeat) || []) as WordProg[]
    // const rangePromise = getCardsStatusRange("wordProgs", 0, maxToRepeat)
    const rangePromise = getSessionCards("wordProgs")
    const allWordsPromise = loadBasicList()
    const range = ((await rangePromise) || []) as WordProg[]
    // console.log(range)
    // console.log("range length:", range.length)
    console.timeLog("t1", "range here")
    await allWordsPromise
    // const allWords = await loadData()
    console.timeLog("t1", "updating")
    setUpdates({ type: "wordProgs", updates: range })
    console.timeLog("t1", "updated!")

    const { learnNumber, repeatNumber, list } = prepareSessionList(range, length)

    // console.log(learnNumber, repeatNumber, list)

    console.timeLog("t1", "session...")

    const content: CombinedWord[] = []
    for (const prog of list) {
        const word = getWordById(prog.id)
        content.push(word)
    }

    console.log(content)

    console.timeLog("t1", "session!")
    return {
        content,
        learnNumber,
        repeatNumber
    }
}

// prepareSession(50)
