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

    timeout: 0, 
    isPlanned: false,
    async fillCard(num: number, id: number) {
        let card = cards[num - 1]
        // console.log(card)
        if (card?.id != id) card = cards.find(c => c.id === id)
        // console.log(card)
        card.card = await useDb("wordCards", "readonly", s => s.get(id)) as WordCard
        card.t = Date.now()
        // console.log(card)
        // document.dispatchEvent(new Event("word-updated"))
        if (!this.timeout) {
            document.dispatchEvent(new Event("word-updated"))

            this.timeout = setTimeout(() => {
                if (this.isPlanned) {
                    document.dispatchEvent(new Event("word-updated"))
                    this.isPlanned = false
                }
                
                clearTimeout(this.timeout)
                // console.log(this.timeout)
                this.timeout = 0
                // console.log(this.timeout)
            }, 50)
            // console.log(this.timeout)
        } else {
            this.isPlanned = true
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