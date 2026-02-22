import { useDb } from "../../indexedDB/dbHandlers"
import { getCard, getCardsKeys } from "../../indexedDB/dbUseCases"
import type { WordCard } from "../types"

let _keys = [] as number[]
let cards: any[] = null

const data = {
    async init() {
        // if (_keys.length) return
        // _keys = await getCardsKeys("wordCards") as number[]
        if (cards) return
        console.timeLog("t1", "cards init")
        const t = Date.now()
        const keys = await useDb("wordCards", "readonly", s => s.getAllKeys()) as number[]
        console.timeLog("t1", "cards keys")
        cards = keys.map((id, i) => ({ id, num: i + 1, t }))
        console.timeLog("t1", "cards parsed")
        console.log(cards)
    },

    timeout: false, 
    async fillCard(num: number, id: number) {
        let card = cards[num - 1];
        // console.log(card)
        if (card?.id != id) card = cards.find(c => c.id === id)
        // console.log(card)
        card.card = await useDb("wordCards", "readonly", s => s.get(id)) as WordCard
        card.t = Date.now()
        console.log(card)
        if (!this.timeout) {
            this.timeout = true
            document.dispatchEvent(new Event("word-updated"))
            setTimeout(() => {
                document.dispatchEvent(new Event("word-updated"))
                this.timeout = false
                console.log(this)
            })
        }
    },

    get cards() {
        return cards
    },

    get keys() {
        return _keys
    },

    async getCard(id: number) {
        return await getCard("wordCards", id)
    }
}

export default data