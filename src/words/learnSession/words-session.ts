import type { CombinedCard } from "../types";
import prepareSession from "./sessionData";

export default class WordsSession extends HTMLElement {
    words: CombinedCard[]

    async connectedCallback() {
        await prepareSession()
    }
}