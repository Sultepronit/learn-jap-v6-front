import type { WordCard } from "../words/types"
import { getIndexed, putMany, useDb } from "./dbHandlers"

type CardStore = "wordCards" | "wordProgs" | "kanjiCards" | "kanjiProgs"

// export async function getCard(store: CardStore, id: number) {
export async function getCard(store: CardStore, id: number | string) {
    return await useDb(store, "readonly", s => s.get(id))
}

export async function getAllCards(store: CardStore) {
    return await useDb(store, "readonly", s => s.getAll())
}

// remove!
export async function getCardsStatusRange(store: CardStore, from: number, to: number) {
    return await getIndexed(store, "status", IDBKeyRange.bound(from, to))
}

export async function saveCards(store: CardStore, data: any[]) {
    await putMany(store, data)
}

export async function saveWordCard(card: WordCard) {
    return await useDb("wordCards", "readwrite", s => s.put(card))
}

export async function tempClearStore(store: CardStore) {
    return await useDb(store, "readwrite", s => s.clear())
}
