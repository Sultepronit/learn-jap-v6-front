import { emit, EVT } from "../../global/events"
import type { Mark } from "../../global/types"
import { getNow } from "../../helpers/time"
import type { CombinedKanji } from "../types"
import type { KanjiSession } from "./sessionData"

const genRepeatStatus = () => Math.floor(Date.now() / 8640000) - 180650
console.log(genRepeatStatus())

export default function update(k: CombinedKanji, mark: Mark, stats: KanjiSession["stats"]) {
    const prog = k.prog.data
    const stage = k.comp.stage

    prog.t = getNow()

    stats.tries++
    if (mark !== "retry") stats.results++

    stats[stage][mark]++

    if (mark === "retry") k.comp.retrying = true

    if (prog.status === -0.5) prog.status = 0

    // TEMP!
    if (prog.status === -1) {
        prog.status = 0
        k.card.data.created = prog.t
        emit(EVT.CARD_MUTATED, { type: "kanjiCards", card: k.card })
    }

    console.log("before update:")
    console.log(prog)

    switch (mark) {
        case "bad":
            prog.status = stage === "learn" ? -0.5 : 0
            prog.progress = 0
            if (stage === "repeat") prog.record = -1
            delete prog.autorepeat
            break
        case "good":
            prog.status = stage === "learn" ? 1 : genRepeatStatus()
            prog.progress = 0

            if (stage === "repeat") {
                prog.record++
                if (prog.record > 1) prog.autorepeat = true
            }
            break
        default:
            prog.progress--
            if (stage === "repeat") prog.record = -1
            break
    }
    console.log("updated:")
    console.log(prog)

    k.v++
    emit(EVT.CARD_MUTATED, { type: "kanjiProgs", card: k.prog })
    emit(EVT.KANJI_UPDATED)
}
