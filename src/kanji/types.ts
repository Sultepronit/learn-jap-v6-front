export type KanjiCard = {
    id: string
    v: number
    syncV: number
    toSync?: 1
    data: {
        created: number
        readings: string
        links: {
            main: number[]
            other?: number[]
        }
        details?: {
            obsolete?: string
        }
    }
}

export type KanjiProg = {
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
    words?: {
        v: number
        main?: any[]
        other?: any[]
    }
}

export type CombinedKanji = {
    id: string
    num: number
    v: number
    card: KanjiCard
    prog: KanjiProg
    comp?: Computed
}
