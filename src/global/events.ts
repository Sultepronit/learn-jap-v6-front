import type { SyncCard } from "./types"

export const EVT = {
    CARD_MUTATED: "card-mutated",
    WORD_UPDATED: "word-updated",
    WORD_UPDATES_RECEIVED: "word-updates-received",
    WORDS_COUNT_CHANGED: "words-count-changed",
    WORD_DELETE_INIT: "word-delete-init",
    WORDS_DELETED: "words-deleted",
    UPDATE_NOT_ENDED: "update-not-ended",
    SYNC_STATUS_CHANGED: "sync-status-changed",
    CONNECTION_STATUS_UPDATED: "connection-status-updated"
} as const

type EventName = typeof EVT[keyof typeof EVT]

interface EventPayloads {
    "card-mutated": { type: string, card: SyncCard }
    "word-updated": undefined
    "word-updates-received": { type: string, updates: SyncCard[] }
    "words-count-changed": undefined
    "word-delete-init": number
    "words-deleted": { ids: number[], locally?: true }
    "update-not-ended": undefined
    "sync-status-changed": string
    "connection-status-updated": string
}

export function emit<T extends EventName>(eventName: T, detail?: EventPayloads[T]) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

type eventCallback<T extends EventName> = (detail: EventPayloads[T]) => void
export function on<T extends EventName>(eventName: T, callback: eventCallback<T>) {
    const handler = (e: Event) => callback((e as CustomEvent).detail)
    document.addEventListener(eventName, handler)
}