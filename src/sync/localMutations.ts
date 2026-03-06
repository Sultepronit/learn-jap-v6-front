import { MSG, on } from "../global/events";
import { saveWordCard } from "../indexedDB/dbUseCases";
import type { SyncBlock, WordCard } from "../words/types";
import { useSaveQuery } from "./localDbQuery";
import { sync, toSync } from "./sync";

function handleWordCard(card: WordCard) {
    card.v++
    card.toSync = 1
    console.log(card)
    toSync.wordCards.set(card.id, card)
    console.log(toSync)
    // saveWordCard(card)
    useSaveQuery("wordCards", [card])
    sync()
}

function handleMutation({ card, type }: { card: SyncBlock, type: string }) {
    card.v++
    card.toSync = 1
    console.log(card)
    toSync[type].set(card.id, card)
    console.log(toSync)
    // saveWordCard(card)
    useSaveQuery(type, [card])
    sync()
}

export default function setMutationsListener() {
    on(MSG.WORD_CARD_MUTATED, handleWordCard)
    on(MSG.CARD_MUTATED, handleMutation)

}