import type { Mark } from "../../global/types"
import type { CombinedWord, Progress } from "../types"
import type { WordsSession } from "./sessionData"

let nextRepeatStatus = 15000
export default function update(
    word: CombinedWord,
    mark: Mark,
    stats: WordsSession["stats"]
) {
    const prog = word.prog.data
    const actual = prog[word.comp.dir]
    const stage = word.comp.stage

    prog.t = Date.now()
    stats.clicks++
    stats[stage][mark]++
    if (mark !== "retry" && stage !== "autorepeat") stats.results++

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
    console.log("updated:", word)
}
