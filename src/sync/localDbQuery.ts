import { putMany } from "../indexedDB/dbHandlers";
import globalVersions from "./globalVersions";

type entry = { store: string, updates: any[], newV?: number }

const query: entry[] = []
let isBusy = false

export async function useSaveQuery(store: string, updates: any[], newV?: number) {
    query.push({ store, updates, newV })
    console.log(query)
    if (isBusy) return

    isBusy = true
    while (query.length > 0) {
        const task = query.shift()
        console.log(task)
        const re = await putMany(task.store, task.updates) 
        console.log(re, task.newV)
        if (re === "success" && task.newV) {
            globalVersions.set(task.store, task.newV)
        }
    }
    isBusy = false
}