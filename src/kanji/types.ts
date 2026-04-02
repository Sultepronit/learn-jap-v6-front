export type KanjiCard = {
    id: number
    v: number
    syncV: number
    toSync?: 1
    data: {
        kanji: string
        readings: string
        links: {
            main: number[]
            other?: number[]
        }
        similar?: string
    }
}

export type KanjiProg = {
    id: number
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

export type CombinedWord = {
    id: number
    num: number
    v: number
    card: KanjiCard
    prog: KanjiProg
    comp?: Computed
}
