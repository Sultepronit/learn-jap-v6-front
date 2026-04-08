import { getNow } from "../helpers/time"
import { putMany } from "../indexedDB/dbHandlers"
import { tempClearStore, saveCards } from "../indexedDB/dbUseCases"
import type { KanjiCard, KanjiProg } from "../kanji/types"
import type { WordCard, WordProg } from "../words/types"
import fetchInitData from "./fetchInitData"
import { jooyoo } from "./jooyoo"

export async function parseInitData() {
    // const initData = JSON.parse(localStorage.getItem('initData')) as any[]
    const initData = await fetchInitData()
    // console.log(initData)

    // const part = initData.slice(0, 100)

    const wordCards: WordCard[] = []
    const wordProgs: WordProg[] = []

    for (const rawCard of initData) {
        // console.table(rawCard);
        const {
            id,
            writings,
            altWriting,
            rareWritings,
            readings,
            rareReadings,
            translation,
            example,
            repeatStatus,
            fProgress,
            fRecord,
            fAutorepeat,
            bProgress,
            bRecord,
            bAutorepeat
        } = rawCard

        const wordCard: WordCard = {
            id,
            v: 0,
            syncV: 0,
            data: {
                writings: {
                    main: writings.split(", "),
                    ...(altWriting && { alt: true }),
                    ...(rareWritings && { rare: rareWritings.split(", ") })
                },
                readings: {
                    main: readings.split(", "),
                    ...(rareReadings && { rare: rareReadings.split(", ") })
                },
                translation: translation,
                ...(example && { example })
            }
        }
        // console.table(wordCard)
        wordCards.push(wordCard)

        const wordProg: WordProg = {
            id,
            v: 0,
            syncV: 0,
            data: {
                status: repeatStatus === -2 ? -0.5 : repeatStatus,
                f: {
                    progress: fProgress,
                    record: fRecord,
                    ...(fAutorepeat && { autorepeat: true })
                },
                b: {
                    progress: bProgress,
                    record: bRecord,
                    ...(bAutorepeat && { autorepeat: true })
                },
                t: 0
            }
        }
        // console.table(wordProg)
        wordProgs.push(wordProg)
    }
    console.log(wordCards)
    tempClearStore("wordCards")
    tempClearStore("wordProgs")
    saveCards("wordCards", wordCards)
    putMany("wordProgs", wordProgs)
}

export async function parseInitKanjiData() {
    const initData = JSON.parse(localStorage.getItem("initData")) as any[]
    // const initData = await fetchInitData()
    console.log(initData)

    const joMap = new Map(jooyoo.map(c => [c[0], c]))
    console.log(joMap)

    const kanjiCards: KanjiCard[] = []
    const kanjiProgs: KanjiProg[] = []

    const presentKanji = new Set<string>()

    for (const rawCard of initData) {
        // console.table(rawCard)
        const {
            id,
            kanji,
            readings,
            links,
            otherLinks,
            repeatStatus,
            progress,
            record,
            autorepeat
        } = rawCard

        presentKanji.add(kanji)

        const parsedLinks = JSON.parse(links)
        const jk = joMap.get(kanji)

        const kanjiCard: KanjiCard = {
            id: kanji,
            v: 0,
            syncV: 0,
            data: {
                created: id,
                readings,
                links: {
                    main: parsedLinks,
                    ...(otherLinks !== "[]" && { other: JSON.parse(otherLinks) })
                },
                ...(jk && jk[1] && { details: { obsolete: jk[1] } })
            }
        }
        // console.table(kanjiCard)
        kanjiCards.push(kanjiCard)

        const kanjiProg: KanjiProg = {
            id: kanji,
            v: 0,
            syncV: 0,
            data: {
                // status: parsedLinks.length > 0 ? repeatStatus : -2,
                status: repeatStatus,
                progress,
                record,
                ...(autorepeat && { autorepeat: true }),
                t: 0
            }
        }
        // console.table(wordProg)
        kanjiProgs.push(kanjiProg)
    }

    const lastJooyoo = jooyoo.filter(e => !presentKanji.has(e[0]))
    console.log("jooyoo:", lastJooyoo)

    for (const jk of lastJooyoo) {
        const { card, prog } = createKanji(jk[0], jk[3], jk[1])
        kanjiCards.push(card)
        kanjiProgs.push(prog)
    }

    console.log(kanjiCards)
    // console.log(kanjiProgs)
    // tempClearStore("kanjiCards")
    // tempClearStore("kanjiProgs")
    saveCards("kanjiCards", kanjiCards)
    saveCards("kanjiProgs", kanjiProgs)
}

export function createKanji(kanji: string, readings: string, obsolete: string) {
    const card: KanjiCard = {
        id: kanji,
        v: 0,
        syncV: 0,
        data: {
            created: getNow(),
            readings,
            links: { main: [] },
            ...(obsolete && { details: { obsolete } })
        }
    }

    const prog: KanjiProg = {
        id: kanji,
        v: 0,
        syncV: 0,
        data: {
            status: -1,
            progress: 0,
            record: 0,
            t: 0
        }
    }

    return { card, prog }
}
