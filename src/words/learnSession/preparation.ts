import { emit, EVT, on } from "../../global/events"
import { genRandomInt, randomize } from "../../helpers/random"
import { getCardsStatusRange } from "../../indexedDB/dbUseCases"
import globalVersions from "../../sync/globalVersions"
import { getWordById, loadBasicList, setUpdates } from "../data/data"
import type { CombinedWord, WordProg } from "../types"
import { detectDirection, papareWord } from "./helpers"
import update from "./update"

function prepareRepeatList(all: WordProg[], length: number) {
    const re: WordProg[] = []
    let normal = 0
    for (let i = 0; i < 1000; i++) {
        const ri = genRandomInt(all.length)
        const wProg = all[ri]
        if (!wProg) continue

        re.push(wProg)
        delete all[ri]
        const d = detectDirection(wProg)
        if (!wProg.data[d].autorepeat) normal++
        if (normal >= length) break
    }
    return re
}

function prepareSessionContent(candidates: WordProg[], sessionLenth: number) {
    const splitInex = candidates.findIndex(e => e.data.status > 0)
    if (splitInex < 0) return

    const learnList = candidates.slice(0, splitInex)
    const allToRepeat = candidates.slice(splitInex)
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
    const maxToRepeat = 8800
    // const maxToRepeat = 8000

    console.timeLog("t1", "range init")
    // const range = (await getCardsStatusRange("wordProgs", 0, maxToRepeat) || []) as WordProg[]
    const rangePromise = getCardsStatusRange("wordProgs", 0, maxToRepeat)
    const allWordsPromise = loadBasicList()
    const range = ((await rangePromise) || []) as WordProg[]
    // console.log(range)
    console.log(range.length)
    console.timeLog("t1", "range here")
    await allWordsPromise
    // const allWords = await loadData()
    console.timeLog("t1", "updating")
    setUpdates({ type: "wordProgs", updates: range })
    console.timeLog("t1", "updated!")

    const { learnNumber, repeatNumber, list } = prepareSessionContent(range, length)

    console.log(learnNumber, repeatNumber, list)

    console.timeLog("t1", "session...")

    const re: CombinedWord[] = []
    for (const prog of list) {
        const word = getWordById(prog.id)
        re.push(word)
    }

    console.log(re)

    console.timeLog("t1", "session!")
    return re
}
