import { getCard as getWordCard } from "../words/data/data";
import type { CombinedCard, Msg, WordCard, WordProg } from "../words/types";

function implementAccepted() {

}

export function implementUpdates(msg: Msg[]) {
    for (const m of msg) {
        console.log(m)
        let getCard: (num: number, id: number) => CombinedCard
        let part: string
        if (m.type === "wordCards") {
            getCard = getWordCard
            part = "card"
        }
        for (const uc of m.updated) {
            const lc = getCard(-1, uc.id)[part]
            console.log(lc, uc)
            if (uc.v >= lc.v) {
                
            }
        }
    }
}