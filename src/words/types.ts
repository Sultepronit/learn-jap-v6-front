// interface BaseWordCard {
//     id: number,
//     v: number,
//     toSync: boolean
// }

// export interface ActiveWordCard extends BaseWordCard {
//     data: {
//         num: number,
//         writings: string[],
//         altWriting: boolean,
//         rareWritings: string[],
//         readings: string[],
//         rareReadings: string[],
//         translation: string[],
//         example: string
//     }
// }

// interface DeletedWordCard extends BaseWordCard {
//     deleted: true
// }

// export type WordCard = ActiveWordCard | DeletedWordCard

// export type WordCard = {
//     id: number,
//     v: number,
//     toSync?: true,
//     data: {
//         num: number,
//         writings: string[],
//         altWriting: boolean,
//         rareWritings: string[],
//         readings: string[],
//         rareReadings: string[],
//         translation: string[],
//         example: string
//     }
// }

// export type WordCard = {
//     id: number
//     v: number
//     syncV: number
//     toSync?: 1
//     data: {
//         writings: string[]
//         altWriting: boolean
//         rareWritings: string[]
//         readings: string[]
//         rareReadings: string[]
//         translation: string
//         example: string
//     }
// }

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

// export type WordProg = {
//     id: number,
//     v: number,
//     tempV?: number
//     status: number,
//     f: Progress,
//     b: Progress
// }

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