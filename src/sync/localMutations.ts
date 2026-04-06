import { EVT, on } from "../global/events"
import type { SyncCard } from "../global/types"
import { useSaveQuery } from "./localDbQuery"
import { toSync } from "./sync"

function handleMutation({ card, type }: { card: SyncCard; type: string }) {
    card.v++
    card.toSync = 1
    toSync[type].set(card.id, card)
    useSaveQuery(type, [card])
}

function handleMutations({ cards, type }: { cards: SyncCard[]; type: string }) {
    for (const card of cards) {
        card.v++
        card.toSync = 1
        // toSync[type].set(card.id, card)
    }
    useSaveQuery(type, cards)
}

export default function setMutationsListener() {
    on(EVT.CARD_MUTATED, handleMutation)
    on(EVT.CARDS_MUTATED, handleMutations)
}
