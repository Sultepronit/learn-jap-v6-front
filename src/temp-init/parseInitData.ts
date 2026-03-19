import { putMany } from "../indexedDB/dbHandlers";
import { tempClearStore, saveCards } from "../indexedDB/dbUseCases";
import type { WordCard, WordProg } from "../words/types";
import fetchInitData from "./fetchInitData";

export default async function parseInitData() {
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
            // cardNumber,
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
                // writings: writings.split(", "),
                // altWriting: !!altWriting,
                // rareWritings: rareWritings.split(", "),
                // readings: readings.split(", "),
                // rareReadings: rareReadings.split(", "),
                writings: {
                    main: writings.split(", "),
                    ...(altWriting && { alt: true }),
                    ...(rareWritings && { rare: rareWritings.split(", ") }),
                },
                readings: {
                    main: readings.split(", "),
                    ...(rareReadings && { rare: rareReadings.split(", ") }),
                },
                translation: translation,
                example
            }
        }
        // console.table(wordCard)
        wordCards.push(wordCard)

        const wordProg: WordProg = {
            id,
            v: 0,
            syncV: 0,
            data: {
                status: repeatStatus,
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
    // clearStore("wordCards")
    // clearStore("wordProgs")
    saveCards("wordCards", wordCards)
    putMany("wordProgs", wordProgs)
}