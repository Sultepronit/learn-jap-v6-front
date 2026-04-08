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

export function createKanji(id: string, created: number) {
    const card: KanjiCard = {
        id,
        v: 0,
        syncV: -1,
        toSync: 1,
        data: {
            created,
            readings: "",
            links: { main: [] }
        }
    }

    const word = {
        id,
        num: id.codePointAt(0),
        v: 0,
        card,
        prog: createKanjiProg(id)
    }

    return word
}
