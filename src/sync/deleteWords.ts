import { emit, EVT, on } from "../global/events"
import { deleteWordsFromDb } from "../indexedDB/dbHandlers"

export const deletedWords = {
    value: JSON.parse(localStorage.getItem("deletedWords")),

    add(id: number) {
        this.value ? this.value.push(id) : this.value = [id]
        console.log(this.value)
        localStorage.setItem("deletedWords", JSON.stringify(this.value))
    },

    remove(ids: number[]) {
        if (!this.value) return

        this.value = this.value.filter(id => !ids.includes(id))
        if (this.value.length < 1) this.value = null
        localStorage.setItem("deletedWords", JSON.stringify(this.value))
    }
}

export function deleteLocally(ids: number[]) {
    deleteWordsFromDb(ids)
    deletedWords.add(ids[0])
}

export async function deleteRemotely(ids: number[]) {
    const re = await deleteWordsFromDb(ids)
    if (re !== "success") return 

    deletedWords.remove(ids)
    emit(EVT.WORDS_DELETED, { ids })

    return "success"
}

on(EVT.WORDS_DELETED, ({ ids, locally }) => {
    if (locally) deleteLocally(ids)
})