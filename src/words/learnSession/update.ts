import { emit, EVT } from "../../global/events"
import type { Mark } from "../../global/types"
import type { CombinedWord, Progress } from "../types"
import type { WordsSession } from "./sessionData"

let nextRepeatStatus = 15000
export default function update(word: CombinedWord, mark: Mark, stats: WordsSession["stats"]) {
    const prog = word.prog.data
    const actual = prog[word.comp.dir]
    const stage = word.comp.stage

    prog.t = Date.now()
    if (stage !== "autorepeat") stats.tries++
    if (mark !== "retry" && stage !== "autorepeat") stats.results++

    stats[stage][mark]++

    console.log("before update:")
    console.table(prog)
    switch (mark) {
        case "bad":
            prog.status = stage === "learn" ? -2 : 0
            const empty: Progress = {
                progress: 0,
                record: 0
            }
            prog.f = empty
            prog.b = empty
            break
        case "good":
            actual.progress = 1

            if (stage === "repeat") {
                actual.record++
                if (actual.record > 1) actual.autorepeat = true
            } else if (stage === "autorepeat") {
                delete actual.autorepeat
            }

            if (prog.f.progress > 0 && prog.b.progress > 0) {
                stats[stage].upgrade++

                prog.status = stage === "learn" ? 1 : nextRepeatStatus++
                prog.f.progress = 0
                prog.b.progress = 0
            }
            break
        default:
            actual.progress--
            if (stage === "repeat") actual.record = -1
            break
    }
    console.log("updated:")
    console.table(prog)

    word.v++
    emit(EVT.CARD_MUTATED, { type: "wordProgs", card: word.prog })
    emit(EVT.WORD_UPDATED)
}
