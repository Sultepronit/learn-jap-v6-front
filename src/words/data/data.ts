import { getCard, getCardsKeys } from "../../indexedDB/dbUseCases"

let _keys = [] as number[]

const data = {
    async init() {
        if (_keys.length) return
        _keys = await getCardsKeys("wordCards") as number[]
    },

    get keys() {
        return _keys
    },

    async getCard(id: number) {
        return await getCard("wordCards", id)
    }
}

export default data