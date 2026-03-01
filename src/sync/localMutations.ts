import { MSG, on } from "../global/events";
import { saveWordCard } from "../indexedDB/dbUseCases";
import { getCard } from "../words/data/data";
import { toSync } from "./sync";

function handleWordCard({ num, id }) {
    console.log(num, id)
    const card = getCard(num, id)
    card.card.tempV = card.card.tempV ? card.card.tempV + 1 : 1
    console.log(card)
    // toSync.add(["word", "card", card])
    toSync.wordCards.add(card.card)
    console.log(toSync)
    saveWordCard(card.card)
}

export default function setMutationsListener() {
    on(MSG.WORD_CARD_MUTATED, handleWordCard)
}