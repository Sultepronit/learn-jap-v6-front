import type { WordCard } from "../words/types"
import { putMany, useDb } from "./dbHandlers"

// function dbErrorAlert(e: Error) {
//     console.warn(e)
//     // alert(e.message)
// }

type CardStore = "wordCards" | "wordProgs"
export async function saveCards(store: CardStore, data: any[]) {
    await putMany(store, data)
}

export async function saveWordCard(card: WordCard) {
    return await useDb("wordCards", "readwrite", s => s.put(card))
}

export async function getAllCards(store: CardStore) {
    return await useDb(store, "readonly", s => s.getAll())
}

export async function clearStore(store: CardStore) {
    return await useDb(store, "readwrite", s => s.clear())
}