import { genRandomInt } from "../../helpers/random"
import type { CombinedWord } from "../types"

const accents = {
    "(": "rare-w",
    "[": "normal-w",
    "{": "alternant-w"
}

function genAWrit(input: string[]) {
    const text = input.join("　")
    console.log("gen!")

    let isHtml = false
    const value = text.replace(/[(\[{}\])]/g, match => {
        if (match) isHtml = true
        return accents[match] ? `<span class="${accents[match]}">` : "</span>"
    })
    return { value, isHtml }
}

const brackets = [/\([^)]*\)|[[\]{}]/g, /\([^)]*\)|\{[^}]*\}|[[\]]/g]
function genQWrit(input: string[]) {
    console.log("gen!")
    const ri = genRandomInt(2)
    return input.map(e => e.replace(brackets[ri], ""))
}

export function computeCommon(word: CombinedWord) {
    const input = word.card?.data
    if (!input) return
    if (word.comp?.common?.v === word.card.v) return

    if (!word.comp) word.comp = {} as CombinedWord["comp"]

    word.comp.common = {
        v: word.card.v,
        writings: {
            main: genAWrit(input.writings.main),
            ...(input.writings.rare && { rare: genAWrit(input.writings.rare) })
        },
        readings: {
            main: input.readings.main.join("　"),
            ...(input.readings.rare && { rare: input.readings.rare.join("　") })
        }
    }
}

function fakeToKata(hira: string) {
    return hira
    return `[${hira}]`
}

export function computeAll(word: CombinedWord) {
    computeCommon(word)
    const input = word.card?.data
    if (!input) return
    if (word.comp?.learn?.v === word.card.v) return

    const mainReadKata = input.readings.main.map(e => fakeToKata(e))
    const rareReadKata = input.readings.rare?.map(e => fakeToKata(e))

    word.comp.learn = {
        v: word.card.v,
        writQuest: genQWrit(input.writings.main),
        readKata: {
            question: mainReadKata,
            answer: {
                main: mainReadKata.join("　"),
                ...(rareReadKata && { rare: rareReadKata.join("　") })
            }
        }
    }
}
