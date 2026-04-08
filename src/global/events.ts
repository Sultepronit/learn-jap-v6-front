import type { WordsSession } from "../words/learnSession/sessionData"
import type { CombinedWord } from "../words/types"
import type { Mark, SyncCard, SyncKanji, SyncWord } from "./types"

export const EVT = {
    LOGIN: "login",

    /** data for saving */
    CARD_MUTATED: "card-mutated",
    CARDS_MUTATED: "cards-mutated",

    /** view update */
    WORD_UPDATED: "word-updated",

    WORD_UPDATES_RECEIVED: "word-updates-received",

    /** view update */
    WORDS_COUNT_CHANGED: "words-count-changed",

    /** locally deleted word's id for sync */
    WORD_DELETE_INIT: "word-delete-init",

    /** list of deleted words' ids for the view update */
    WORDS_DELETED: "words-deleted",

    /** view update */
    KANJI_UPDATED: "kanji-updated",

    KANJI_UPDATES_RECEIVED: "kanji-updates-received",

    /** view update */
    KANJI_COUNT_CHANGED: "kanji-count-changed",

    UPDATE_NOT_ENDED: "update-not-ended",
    SYNC_STATUS_CHANGED: "sync-status-changed",
    CONNECTION_STATUS_UPDATED: "connection-status-updated",

    /** words learning session */
    WS: {
        NEXT_CARD: "ws:next-card",
        WORD_UPDATED: "ws:word-updated",
        HINT_REQUESTED: "ws:hint-requested",
        ANSWER_REQUESTED: "ws:answer-requested",
        WORD_EVALUATED: "ws:word-evaluated",
        STATS_UPDATED: "ws:stats-updated",
        ENDED: "ws:ended",
        RESET_REQUESTED: "ws:reset-requested"
    }
} as const

type DeepValue<T> = T extends string ? T : T extends object ? DeepValue<T[keyof T]> : never
export type EventName = DeepValue<typeof EVT>
// type EventName = (typeof EVT)[keyof typeof EVT]

interface EventPayloads {
    login: string
    "card-mutated": { type: string; card: SyncCard }
    "cards-mutated": { type: string; cards: SyncCard[] }

    "word-updated": undefined
    "word-updates-received": { type: string; updates: SyncWord[] }
    "words-count-changed": undefined
    "word-delete-init": number
    "words-deleted": number[]

    "kanji-updated": undefined
    "kanji-updates-received": { type: string; updates: SyncKanji[] }
    "kanji-count-changed": undefined

    "update-not-ended": undefined
    "sync-status-changed": string
    "connection-status-updated": string

    "ws:next-card": CombinedWord
    "ws:word-updated": undefined
    "ws:hint-requested": undefined
    "ws:answer-requested": undefined
    "ws:word-evaluated": Mark
    "ws:stats-updated": WordsSession
    "ws:ended": undefined
    "ws:reset-requested": undefined
}

export function emit<T extends EventName>(eventName: T, detail?: EventPayloads[T]) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export function on<T extends keyof EventPayloads>(
    eventName: T,
    callback: (detail: EventPayloads[T]) => void,
    once = false
) {
    const handler = (e: CustomEvent<EventPayloads[T]>) => callback(e.detail)
    document.addEventListener(eventName, handler as EventListener, { once })
}
