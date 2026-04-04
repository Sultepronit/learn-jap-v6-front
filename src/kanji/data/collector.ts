import { areArraysEqual } from "../../helpers/array"
import { getUniqueKanji } from "../../helpers/text"
import { loadAll as loadAllWords, loadBasicList as loadBasicWordsList } from "../../words/data/data"
import { loadBasicList } from "./data"

export default async function collectKanji() {
    const words = await loadBasicWordsList()
    const kanjiPromise = loadBasicList()
    // await loadAllWords("wordCards")
    // await loadAllWords("wordProgs")
    await Promise.all([loadAllWords("wordCards"), loadAllWords("wordProgs")])
    console.log(words)
    // const testBlock = words.slice(0, 100)

    const mainLinks = new Map<String, number[]>()
    // for (const w of testBlock) {
    for (const w of words) {
        // if (w.prog.data.status === -0.5) continue
        if (w.prog.data.status === -1) break
        // console.log(w.id)
        // console.log(w.card.data.writings)
        const writ = w.card.data.writings
        // const main = writ.alt ? "" : writ.main.join("")
        let mainBulk = ""
        let otherBulk = ""
        if (!writ.alt) {
            mainBulk = writ.main.join("")
        } else {
            otherBulk = writ.main.join("")
        }
        if (writ.rare) otherBulk += writ.rare.join("")

        const main = mainBulk ? getUniqueKanji(mainBulk) : []
        let other = otherBulk ? getUniqueKanji(otherBulk) : []
        other = other.filter(o => !main.includes(o))
        // console.log(mainBulk, "/", otherBulk)
        // console.log(main)
        // console.log(other)
        for (const k of main) {
            const list = mainLinks.get(k)
            if (list) {
                list.push(w.id)
            } else {
                mainLinks.set(k, [w.id])
            }
        }
    }
    console.log(mainLinks)

    const kanji = await kanjiPromise
    console.log(kanji)
    for (const k of kanji) {
        const ml = mainLinks.get(k.id)
        const kl = k.card.data.links
        if (!ml) {
            kl.main = []
        } else {
            if (!areArraysEqual(kl.main, ml)) {
                console.log(k.id)
            }
            mainLinks.delete(k.id)
        }
    }
    console.log("new:", mainLinks)
}
