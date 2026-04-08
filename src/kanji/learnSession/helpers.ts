import { EVT, on } from "../../global/events"
import type { CombinedKanji } from "../types"

export async function papareKanji(k: CombinedKanji) {
    if (!k.comp) k.comp = {}

    while (!k.prog) {
        await new Promise(res => on(EVT.KANJI_UPDATED, res, true))
    }
    // console.log(word.prog)
    k.comp.stage = k.prog.data.status > 0 ? "repeat" : "learn"
}
