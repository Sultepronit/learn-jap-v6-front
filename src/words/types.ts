export type WordCard = {
    id: number
    v: number
    syncV: number
    toSync?: 1
    data: {
        writings: {
            main: string[]
            alt?: true
            rare?: string[]
        } 
        readings: { 
            main: string[]
            rare?: string[]
        }
        translation: string
        example: string
    }
}

interface Progress {
    progress: number,
    record: number,
    autorepeat?: true
}

export type WordProg = {
    id: number,
    v: number,
    syncV: number
    toSync?: 1
    data: {
        status: number,
        f: Progress,
        b: Progress
    }
}

export type CombinedCard = {
    id: number
    num: number
    v: number
    card: WordCard
    prog: WordProg
}

// export interface SyncBlock {
//     id: number,
//     v: number,
//     syncV: number
//     toSync?: 1
//     data: any
// }

// export type Msg = {
//     type: string
//     v: number
//     // updated?: WordCard[] | WordProg[]
//     updated?: SyncBlock[]
//     // accepted?: WordCard[] | WordProg[]
//     accepted?: WordCard[] | WordProg[]
// }