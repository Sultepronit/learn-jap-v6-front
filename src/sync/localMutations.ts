import { EVT, on } from "../global/events";
import type { SyncBlock } from "../words/types";
import { useSaveQuery } from "./localDbQuery";
import { toSync } from "./sync";

function handleMutation({ card, type }: { card: SyncBlock, type: string }) {
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