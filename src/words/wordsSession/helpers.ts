import { EVT, on } from "../../global/events"
import type { CombinedWord, WordProg } from "../types"

export function detectDirection(wProg: WordProg) {
    return wProg.data.f.progress === 1 ? "b" : "f"
}

export async function papareWord(word: CombinedWord) {
    if (!word.comp) word.comp = {}

    while (!word.prog) {
        await new Promise(res => on(EVT.WORD_UPDATED, res, true))
    }
    // console.log(word.prog)
    word.comp.dir = detectDirection(word.prog)
    word.comp.stage = word.prog.data[word.comp.dir].autorepeat
        ? "autorepeat"
        : word.prog.data.status > 0
          ? "repeat"
          : "learn"
}
