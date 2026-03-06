import { emit, MSG } from "../global/events";
import { saveWordCard } from "../indexedDB/dbUseCases";
import { getCard as getWordCard } from "../words/data/data";
import type { CombinedCard, Msg, SyncBlock, WordCard, WordProg } from "../words/types";
import { useSaveQuery } from "./localDbQuery";

export async function implementUpdates(msg: Msg[], toSync: Record<string, Map<number, any>>) {
    for (const m of msg) {
        console.log(m)
        const updates: SyncBlock[] = []
        const fullUpdates: SyncBlock[] = []
        
        for (const rc of m.accepted ?? []) {
            const lc = toSync[m.type].get(rc.id) as SyncBlock
            console.log(rc, lc)
            if (!lc) console.warn("What the heck?")

            lc.syncV = rc.syncV

            if (rc.v === lc.v) { 
                delete lc.toSync
                toSync[m.type].delete(lc.id)
            }

            updates.push(lc)
        }
        
        for (const rc of m.updated ?? []) {
            const lc = toSync[m.type].get(rc.id) as SyncBlock
            console.log(rc, lc)
            if (lc) {
                lc.syncV = rc.syncV 

                if (rc.v >= lc.v) { // update case
                    delete lc.toSync
                    toSync[m.type].delete(lc.id)

                    lc.v = rc.v
                    lc.data = rc.data

                    fullUpdates.push(lc)
                }

                updates.push(lc)
            } else { // update only in local DB?
                updates.push(rc)
                fullUpdates.push(rc)
            }
        }

        useSaveQuery(m.type, updates, m.v)
        if (fullUpdates.length > 0) {
            console.log("update data!")
            if (m.type === "wordCards" || m.type === "wordProgs") {
                emit(MSG.WORD_UPDATES_RECEIVED, { type: m.type, updates: fullUpdates })
            }
        }
    }
}

