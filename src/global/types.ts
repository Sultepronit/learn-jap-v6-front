// export interface SyncCard {
//     id: number | string
//     v: number
//     syncV: number
//     toSync?: 1
//     data: any
// }

export interface AnySync<T> {
    id: T
    v: number
    syncV: number
    toSync?: 1
    data: any
}

export type SyncCard = AnySync<number | string>
export type SyncWord = AnySync<number>

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
