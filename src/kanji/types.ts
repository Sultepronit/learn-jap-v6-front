export type KanjiCard = {
    // id: number
    id: string
    v: number
    syncV: number
    toSync?: 1
    data: {
        // kanji: string
        order: number
        readings: string
        links: {
            main: number[]
            other?: number[]
        }
        similar?: string
    }
}

export type KanjiProg = {
    // id: number
    id: string
    v: number
    syncV: number
    toSync?: 1
    data: {
        status: number
        progress: number
        record: number
        autorepeat?: true
        t: number
    }
}

type Computed = {
    stage?: "learn" | "repeat"
    retrying?: true
}

export type CombinedKanji = {
    id: string
    num: number
    v: number
    card: KanjiCard
    prog: KanjiProg
    comp?: Computed
}
