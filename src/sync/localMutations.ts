import { MSG, on } from "../global/events";
import { saveWordCard } from "../indexedDB/dbUseCases";
import type { WordCard } from "../words/types";
import { toSync } from "./sync";

function handleWordCard(card: WordCard) {
    card.v++
    card.toSync = 1
    console.log(card)
    toSync.wordCards.add(card)
    toSync.wordCards2.set(card.id, card)
    console.log(toSync)
    saveWordCard(card)
}

export default function setMutationsListener() {
    on(MSG.WORD_CARD_MUTATED, handleWordCard)
}