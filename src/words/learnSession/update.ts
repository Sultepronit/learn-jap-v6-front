import type { Mark } from "../../global/types"
import type { CombinedWord } from "../types"

export default function update(word: CombinedWord, mark: Mark) {
    word.prog.data.t = Date.now()
}
