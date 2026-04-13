export interface AnySync<T> {
    id: T
    v: number
    syncV: number
    toSync?: 1
    data: any
}

export type SyncCard = AnySync<number | string>
export type SyncWord = AnySync<number>
export type SyncKanji = AnySync<string>

export type SyncBlock = {
    type: string
    v: number
    updated?: SyncCard[]
    accepted?: SyncCard[]
}

export type Message = {
    standard: SyncBlock[]
    deletedWords: number[]
}

export type Mark = "good" | "pass" | "retry" | "bad"

export type BigView = "words-session" | "kanji-session"
