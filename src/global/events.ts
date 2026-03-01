export const MSG = {
    WORD_UPDATED: "word-updated",
    WORD_CARD_MUTATED: "word-card-mutated"
} as const

type EventName = typeof MSG[keyof typeof MSG]

interface EventPayloads {
  "word-updated" : undefined;
  "word-card-mutated" : { num: number, id: number };
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
// on(MSG.WORD_CARD_MUTATED, (d) => {console.log(d)})