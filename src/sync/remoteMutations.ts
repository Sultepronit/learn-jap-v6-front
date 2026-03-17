import { emit, EVT } from "../global/events"
import type { SyncBlock, SyncCard } from "../global/types";
import { deleteRemotely } from "./deleteWords";
import { useSaveQuery } from "./localDbQuery";

export async function implementUpdates(blocks: SyncBlock[], toSync: Record<string, Map<number, any>>) {
    for (const m of blocks ?? []) {
        console.log(m)
        const updated: SyncCard[] = []
        const fullyUpdated: SyncCard[] = []
        const deleted: number[] = []
        
        for (const rc of m.accepted ?? []) {
            const lc = toSync[m.type].get(rc.id) as SyncCard
            console.log(rc, lc)
            if (!lc) console.warn("What the heck?")

            lc.syncV = rc.syncV

            if (rc.v === lc.v) { // succesfully synced
                delete lc.toSync
                toSync[m.type].delete(lc.id)
            } else { // still needs to be synced
                emit(EVT.UPDATE_NOT_ENDED)
            }

            updated.push(lc)
        }
        
        for (const rc of m.updated ?? []) {
            if (rc.v === -100) {
                deleted.push(rc.id)
                continue
            }
            const lc = toSync[m.type].get(rc.id) as SyncCard
            console.log(rc, lc)
            if (lc) {
                lc.syncV = rc.syncV 

                if (rc.v >= lc.v) { // accept update
                    delete lc.toSync
                    toSync[m.type].delete(lc.id)

                    lc.v = rc.v
                    lc.data = rc.data

                    fullyUpdated.push(lc)
                } else { // reject update
                    emit(EVT.UPDATE_NOT_ENDED)
                }

                updated.push(lc)
            } else { // update only in local DB?
                updated.push(rc)
                fullyUpdated.push(rc)
            }
        }

        if (deleted.length > 0) {
            console.log("remote delete!")
            const re = await deleteRemotely(deleted)
            if (re !== "success") return
        }
        
        useSaveQuery(m.type, updated, m.v)
        if (fullyUpdated.length > 0) {
            // console.log("update data!")
            if (m.type === "wordCards" || m.type === "wordProgs") {
                emit(EVT.WORD_UPDATES_RECEIVED, { type: m.type, updates: fullyUpdated })
            }
        }
    }
}

