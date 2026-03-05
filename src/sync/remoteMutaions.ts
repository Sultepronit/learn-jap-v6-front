import { saveWordCard } from "../indexedDB/dbUseCases";
import { getCard as getWordCard } from "../words/data/data";
import type { CombinedCard, Msg, WordCard, WordProg } from "../words/types";

function implementAccepted() {

}

export function implementUpdates(msg: Msg[], toSync) {
    for (const m of msg) {
        console.log(m)
        let getCard: (num: number, id: number) => CombinedCard
        let part: string
        if (m.type === "wordCards") {
            getCard = getWordCard
            part = "card"
        }
        for (const rc of m.updated) {
            // const lc = getCard(-1, uc.id)[part]
            // console.log(lc, uc)
            // if (uc.v >= lc.v) {
                
            // }
            const lc = toSync[m.type].get(rc.id)
            console.log(rc, lc)
            let re
            if (lc) {
                if (rc.v > lc.v) {
                    re = rc
                } else {
                    re = lc
                    re.syncV = rc.syncV
                }
            }
            console.log("re:", re)
            if (m.type === "wordCards") {
                // saveWordCard(re)
            }
        }
    }
}