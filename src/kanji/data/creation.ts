import type { KanjiCard, KanjiProg } from "../types"

export function createKanjiProg(id: string) {
    const prog: KanjiProg = {
        id,
        v: 0,
        syncV: -1,
        toSync: 1,
        data: {
            status: 0,
            progress: 0,
            record: 0,
            t: 0
        }
    }

    return prog
}

export function createKanji(num: number, id: string) {
    const card: KanjiCard = {
        id,
        v: 0,
        syncV: -1,
        toSync: 1,
        data: {
            order: num,
            readings: "",
            links: { main: [] }
        }
    }

    const word = {
        id,
        num,
        v: 0,
        card,
        prog: createKanjiProg(id)
    }

    return word
}
