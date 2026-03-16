export interface SyncCard {
    id: number,
    v: number,
    syncV: number
    toSync?: 1
    data: any
}

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