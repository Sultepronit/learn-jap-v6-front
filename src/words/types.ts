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
        example?: string
    }
}

export interface Progress {
    progress: number
    record: number
    autorepeat?: true
}

export type WordProg = {
    id: number
    v: number
    syncV: number
    toSync?: 1
    data: {
        status: number
        f: Progress
        b: Progress
        t: number
    }
}

export type StyledText = {
    value: string
    isHtml: boolean
}

type Computed = {
    common?: {
        v: number
        writings: {
            main: StyledText
            rare?: StyledText
        }
        readings: {
            main: string
            rare?: string
        }
    }
    learn?: {
        v: number
        writQuest: string[]
        readKata: {
            question: string[]
            answer: {
                main: string
                rare?: string
            }
        }
    }
    dir?: "f" | "b"
    stage?: "learn" | "repeat" | "autorepeat"
    retrying?: true
}

export type CombinedWord = {
    id: number
    num: number
    v: number
    card: WordCard
    prog: WordProg
    comp?: Computed
}
