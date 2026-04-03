import { getUniqueKanji } from "../../helpers/text"
import { loadAll as loadAllWords, loadBasicList as loadBasicWordsList } from "../../words/data/data"

export default async function collectKanji() {
    const words = await loadBasicWordsList()
    await loadAllWords("wordCards")
    console.log(words)
    const testBlock = words.slice(0, 10)
    for (const w of testBlock) {
        // console.log(w.id)
        console.log(w.card.data.writings)
        const writ = w.card.data.writings
        // const main = writ.alt ? "" : writ.main.join("")
        let mainBulk = ""
        let otherBulk = ""
        if (writ.alt) {
            mainBulk = writ.main.join("")
        } else {
            otherBulk = writ.main.join("")
        }
        if (writ.rare) otherBulk += writ.rare.join("")

        const main = mainBulk ? getUniqueKanji(mainBulk) : [] // null maybe?
        let other = otherBulk ? getUniqueKanji(otherBulk) : []
        other = other.filter(o => !main.includes(o))
        console.log(mainBulk, "/", otherBulk)
        console.log(main)
        console.log(other)
    }
}
