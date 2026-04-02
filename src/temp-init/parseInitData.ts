import { putMany } from "../indexedDB/dbHandlers"
import { tempClearStore, saveCards } from "../indexedDB/dbUseCases"
import type { KanjiCard, KanjiProg } from "../kanji/types"
import type { WordCard, WordProg } from "../words/types"
import fetchInitData from "./fetchInitData"

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

    const part = initData.slice(0, 100)

    const kanjiCards: KanjiCard[] = []
    const kanjiProgs: KanjiProg[] = []

    // for (const rawCard of initData) {
    for (const rawCard of part) {
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

        const kanjiCard: KanjiCard = {
            id,
            v: 0,
            syncV: 0,
            data: {
                kanji,
                readings,
                links: {
                    main: JSON.parse(links),
                    ...(otherLinks !== "[]" && { other: JSON.parse(otherLinks) })
                }
            }
        }
        // console.table(kanjiCard)
        kanjiCards.push(kanjiCard)

        const kanjiProg: KanjiProg = {
            id,
            v: 0,
            syncV: 0,
            data: {
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
    console.log(kanjiCards)
    console.log(kanjiProgs)
    // tempClearStore("wordCards")
    // tempClearStore("wordProgs")
    saveCards("kanjiCards", kanjiCards)
    saveCards("kanjiProgs", kanjiProgs)
}
