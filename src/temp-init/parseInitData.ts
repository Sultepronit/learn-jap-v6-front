import { saveCards } from "../indexedDB/dbUseCases";
import type { WordCard, WordProg } from "../types/types";

export default function parseInitData() {
    const initData = JSON.parse(localStorage.getItem('initData')) as any[]
    // console.log(initData)

    // const part = initData.slice(0, 100)
    const part = initData;
    console.log(part)

    const wordCards: WordCard[] = []

    for (const rawCard of part) {
        // console.table(rawCard);
        const {
            id,
            cardNumber,
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

        const newId = id + 1000_000_000_000
        const wordCard: WordCard = {
            id: newId,
            v: 0,
            toSync: false,
            data: {
                num: cardNumber,
                writings: writings.split(", "),
                altWriting: !!altWriting,
                rareWritings: rareWritings.split(", "),
                readings: readings.split(", "),
                rareReadings: rareReadings.split(", "),
                translation: translation,
                example
            }
        }
        // console.table(wordCard)
        wordCards.push(wordCard)

        const wordStats: WordProg = {
            id: newId,
            v: 0,
            toSync: false,
            data: {
                status: repeatStatus,
                f: {
                    progress: fProgress,
                    record: fRecord,
                    autorepeat: !!fAutorepeat
                },
                b: {
                    progress: bProgress,
                    record: bRecord,
                    autorepeat: !!bAutorepeat
                }
            }
        }
        console.table(wordStats)
    }
    console.log(wordCards)
    saveCards("wordCards", wordCards)
}