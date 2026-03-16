import { EVT, on } from "../global/events";
import type { SyncCard } from "../global/types";
import { useSaveQuery } from "./localDbQuery";
import { toSync } from "./sync";

function handleMutation({ card, type }: { card: SyncCard, type: string }) {
    card.v++
    card.toSync = 1
    console.log(card)
    toSync[type].set(card.id, card)
    console.log(toSync)
    useSaveQuery(type, [card])
}

export default function setMutationsListener() {
    on(EVT.CARD_MUTATED, handleMutation)
}