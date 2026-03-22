import type { Mark } from "../../global/types"
import type { CombinedWord, Progress } from "../types"

let nextRepeatStatus = 15000
export default function update(word: CombinedWord, mark: Mark) {
    const prog = word.prog.data
    const actual = word.comp.actual
    const stage = word.comp.stage
    console.log(word.comp.actual === word.prog.data[word.comp.dir])
    // word.prog.data.t = Date.now()
    prog.t = Date.now()

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
            console.log(actual)
            console.log(word.comp)
            console.log(prog)
            console.log(word)
            if (stage === "repeat") {
                actual.record++
                if (actual.record > 1) actual.autorepeat = true
            } else if (stage === "autorepeat") {
                delete actual.autorepeat
            }

            if (prog.f.progress > 0 && prog.b.progress > 0) {
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
