import type { SyncBlock, WordCard } from "../words/types";

export const EVT = {
    WORD_UPDATED: "word-updated",
    WORD_CARD_MUTATED: "word-card-mutated",
    CARD_MUTATED: "card-mutated",
    WORD_UPDATES_RECEIVED: "word-updates-received",
    UPDATE_NOT_ENDED: "update-not-ended",
    SYNC_STATUS_CHANGED: "sync-status-changed",
    CONNECTION_STATUS_UPDATED: "connection-status-updated"
} as const

type EventName = typeof EVT[keyof typeof EVT]

interface EventPayloads {
  "word-updated": undefined
  "word-card-mutated": WordCard
  "card-mutated": { type: string, card: SyncBlock }
  "word-updates-received": { type: string, updates: SyncBlock[] }
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