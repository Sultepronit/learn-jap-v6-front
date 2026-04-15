import { genRandomInt, randomize } from "../../helpers/random"
import { areSameDay, getNow } from "../../helpers/time"
import { getSessionCards } from "../../indexedDB/dbHandlers"
import { kanjiIndex, loadBasicList, setUpdates } from "../data/data"
import type { CombinedKanji, KanjiProg } from "../types"

const d = 24 * 60 * 60
function prepareRepeatList(all: KanjiProg[], length: number) {
    const tLimit = getNow() - d * 10
    // console.log(new Date(tLimit * 1000))
    const repeatList: KanjiProg[] = []
    const autoList: KanjiProg[] = []
    for (let i = 0; i < 1000; i++) {
        const ri = genRandomInt(all.length)
        const kProg = all[ri]
        if (!kProg) continue
        // console.log(wProg.data.t)
        if (kProg.data.t > tLimit) {
            console.log(kProg.data)
        } else {
            // console.log(wProg.data.t)
        }
        if (kProg.data.t > tLimit) continue

        if (kProg.data.autorepeat) {
            // implement autorepeat!
            autoList.push(kProg)
            continue
        }

        repeatList.push(kProg)
        all[ri] = null

        if (repeatList.length >= length) break
    }
    console.log("Auto", autoList)

    // return repeatList
    return {
        repeatList,
        autoNumber: autoList.length
    }
}

function prepareLearnList(range: KanjiProg[], learnIdx: number, repeatIdx: number) {
    if (repeatIdx === 0) return []

    const now = getNow()

    const returnList = range.slice(0, learnIdx)
    console.log(returnList)

    // const learnList = candidates.slice(0, splitInex).filter(c => !areSameDay(c.data.t, now))
    const learnList = range.slice(learnIdx, repeatIdx).filter(c => {
        const re = areSameDay(c.data.t, now)
        if (re) console.log(new Date(c.data.t * 1000))
        return !re
    })
    console.log(learnList)

    const tLimit = now - d * 1.5
    for (let i = 0; i < returnList.length / 2; i++) {
        const ri = genRandomInt(returnList.length)
        const wProg = returnList[ri]
        if (!wProg) continue
        if (wProg.data.t > tLimit) continue
        console.log("returned:", wProg)
        // wProg.data.status = 0
        learnList.push(wProg)
        returnList[ri] = null
    }

    return learnList
}

function prepareSessionList(candidates: KanjiProg[], sessionLenth: number, tempNewK: KanjiProg) {
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
    if (tempNewK) learnList.push(tempNewK)

    const allToRepeat = candidates.slice(repeatIdx)
    // console.log(learnList, allToRepeat)

    const repeatNumber = sessionLenth - learnList.length
    const { repeatList, autoNumber } = prepareRepeatList(allToRepeat, repeatNumber)

    const list = [...learnList, ...repeatList]
    randomize(list)
    // console.log(list)

    return {
        learnNumber: learnList.length,
        repeatNumber,
        autoNumber,
        list
    }
}

async function tempAddNewLearning() {
    const k = (await getSessionCards("kanjiProgs", -1, 1)) as KanjiProg[]
    console.log(k[0])
    if (k[0]?.data.status === -1) return k[0]
    return null
}

export default async function prepareSession(length: number) {
    console.timeLog("t1", "range init")
    const rangePromise = getSessionCards("kanjiProgs", -0.5, 700)
    const allKanjiPromise = loadBasicList()
    const range = ((await rangePromise) || []) as KanjiProg[]
    console.log(range)
    console.timeLog("t1", "range here")
    await allKanjiPromise

    const newK = await tempAddNewLearning()
    if (newK) {
        range.push(newK)
    }

    console.timeLog("t1", "updating")
    setUpdates({ type: "kanjiProgs", updates: range })
    console.timeLog("t1", "updated!")

    const { learnNumber, repeatNumber, autoNumber, list } = prepareSessionList(range, length, newK)

    // console.log(learnNumber, repeatNumber, list)

    console.timeLog("t1", "session...")

    const content: CombinedKanji[] = []
    for (const prog of list) {
        const k = kanjiIndex.get(prog.id)
        content.push(k)
    }

    console.log(content)

    console.timeLog("t1", "session!")
    return {
        content,
        learnNumber,
        repeatNumber,
        autorepeated: autoNumber
    }
}
