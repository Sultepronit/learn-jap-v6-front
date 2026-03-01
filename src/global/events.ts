export const EVENT = {
    WORD_UPDATED: "word-updated",
    WORD_CARD_MUTATED: "word-card-mutated"
} as const

type EventName = typeof EVENT[keyof typeof EVENT]

interface EventPayloads {
  "word-updated" : undefined;
  "word-card-mutated" : { userId: number };
}

// export function emit<T extends EventName>(eventName: T, detail?: CustomEventPayloads[T]) {
export function emit<T extends EventName>(eventName: T, detail?: EventPayloads[T]) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

type eventCallback<T extends EventName> = (detail: EventPayloads[T]) => void
export function on<T extends EventName>(eventName: T, callback: eventCallback<T>) {
    const handler = (e: Event) => callback((e as CustomEvent).detail)
    document.addEventListener(eventName, handler)
}

// on(EVENT.WORD_UPDATED, () => {console.log("here!")})