import type { CombinedWord, WordProg } from "../types"

export function detectDirection(wProg: WordProg) {
    return wProg?.data.f.progress === 1 ? "b" : "f"
}

export function papareWord(word: CombinedWord) {
    if (!word.comp) word.comp = {}
    word.comp.dir = detectDirection(word.prog)
    // word.comp.actual = word.prog.data[word.comp.dir]
    word.comp.stage = word.prog?.data[word.comp.dir].autorepeat
        ? "autorepeat"
        : word.prog?.data.status > 0
          ? "repeat"
          : "learn"
}
