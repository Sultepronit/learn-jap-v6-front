import type { CombinedWord } from "../types";

export const LWE = {
    NEXT_WORD: "next-word",
} as const

type EventName = typeof LWE[keyof typeof LWE]

interface EventPayloads {
    "next-word": CombinedWord
}

export function emitLwe<T extends EventName>(eventName: T, detail?: EventPayloads[T]) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

type eventCallback<T extends EventName> = (detail: EventPayloads[T]) => void
export function onLwe<T extends EventName>(eventName: T, callback: eventCallback<T>) {
    const handler = (e: Event) => callback((e as CustomEvent).detail)
    document.addEventListener(eventName, handler)
}