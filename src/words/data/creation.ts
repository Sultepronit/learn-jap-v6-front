import type { WordCard, WordProg } from "../types"

export function createWord(num = 0, id = Infinity) {
    const card: WordCard = {
        id,
        v: 0,
        syncV: -1,
        toSync: 1,
        data: {
            readings: { main: [""] },
            writings: { main: [""] },
            translation: "",
            example: ""
        }
    }

    const prog: WordProg = {
        id,
        v: 0,
        syncV: -1,
        toSync: 1,
        data: {
            status: -1,
            f: {
                progress: 0,
                record: 0
            },
            b: {
                progress: 0,
                record: 0
            },
            t: 0
        }
    }

    const word = {
        id,
        num,
        v: 0,
        card,
        prog
    }
    return word
}
