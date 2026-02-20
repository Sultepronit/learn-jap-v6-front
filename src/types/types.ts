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

export type WordCard = {
    id: number,
    v: number,
    toSync: boolean,
    data: {
        num: number,
        writings: string[],
        altWriting: boolean,
        rareWritings: string[],
        readings: string[],
        rareReadings: string[],
        translation: string[],
        example: string
    }
}

interface Progress {
    progress: number,
    record: number,
    autorepeat: boolean
}

export type WordProg = {
    id: number,
    v: number,
    toSync: boolean,
    data: {
        status: number,
        f: Progress,
        b: Progress
    }
}