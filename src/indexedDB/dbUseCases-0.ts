import { putMany, useDb } from "./dbHandlers"

function dbErrorAlert(e: Error) {
    console.warn(e)
    // alert(e.message)
}

type CardStore = "wordCards" | "wordStats"
export async function saveCards(store: CardStore, data: any[]) {
    try {
        await putMany(store, data)
    } catch (e) {
        dbErrorAlert(e)
    }
}

export async function getAllCards(store: CardStore) {
    try {
        return await useDb(store, "readonly", s => s.getAll())
    } catch (e) {
        dbErrorAlert(e)
    }
}

export async function getCardsKeys(store: CardStore) {
    try {
        return await useDb(store, "readonly", s => s.getAllKeys())
    } catch (e) {
        dbErrorAlert(e)
    }
}

export async function getCard(store: CardStore, id: number) {
    try {
        return await useDb(store, "readonly", s => s.get(id))
    } catch (e) {
        dbErrorAlert(e)
    }
}
