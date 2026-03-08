import { genRandomInt, randomize } from "../../helpers/random";
import { getCardsStatusRange } from "../../indexedDB/dbUseCases";
import { loadData } from "../data/data";
import type { WordProg } from "../types";

function setDirection(wData: WordProg["data"]) {
    // if (wData.f.progress === 1)
    return wData.f.progress === 1 ? "b" : "f"
}

function prepareRepeatList(all: WordProg[], length: number) {
    const re: WordProg[] = []
    let normal = 0
    for (let i = 0; i < 1000; i++) {
        const idx = genRandomInt(all.length)
        // const idx = genRandomInt(3)
        // console.log(idx)
        const word = all[idx]
        // console.log(word)
        if (!word) continue

        re.push(word)
        delete all[idx]
        const d = setDirection(word.data)
        if (!word.data[d].autorepeat) normal++
        if (normal >= length) break
    }
    return re
}

export default async function prepareSession() {
    const sessionLenth = 50
    const maxToRepeat = 8500

    const allWords = await loadData()
    console.log(allWords)
    const range = (await getCardsStatusRange("wordProgs", 0, maxToRepeat) || []) as WordProg[]
    console.log(range)
    console.timeLog("t1", "range!")

    const splitInex = range.findIndex(e => e.data.status > 0)
    if (splitInex < 0) return

    const learnList = range.slice(0, splitInex)
    const allToRepeat = range.slice(splitInex)
    console.log(learnList, allToRepeat)

    const repeatNumber = sessionLenth - learnList.length
    const repeatList = prepareRepeatList(allToRepeat, repeatNumber)

    const all = [...learnList, ...repeatList]
    randomize(all)
    console.log(all)
}