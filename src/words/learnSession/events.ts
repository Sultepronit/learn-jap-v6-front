import type { CombinedWord } from "../types"

export const LWE = {
    NEXT_WORD: "next-word",
    WORD_UPDATED: "session:word-updated",
    HINT_REQUESTED: "hint-requested",
    ANSWER_REQUESTED: "answer-requested",
    WORD_EVALUATED: "word-evaluated"
} as const

export type EventName = (typeof LWE)[keyof typeof LWE]

interface EventPayloads {
    "next-word": CombinedWord
    "session:word-updated": undefined
    "hint-requested": undefined
    "answer-requested": undefined
    "word-evaluated": string
}

export function emitLwe<T extends EventName>(
    eventName: T,
    detail?: EventPayloads[T]
) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }))
}

type eventCallback<T extends EventName> = (detail: EventPayloads[T]) => void
export function onLwe<T extends EventName>(
    eventName: T,
    callback: eventCallback<T>
) {
    const handler = (e: Event) => callback((e as CustomEvent).detail)
    document.addEventListener(eventName, handler)
}
