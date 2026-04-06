// localStorage.clear()

const globalVersions = {
    _mem: {
        wordCards: Number(localStorage.getItem("wordCardsV")) || -1,
        wordProgs: Number(localStorage.getItem("wordProgsV")) || -1,
        kanjiCards: Number(localStorage.getItem("kanjiCardsV")) || 0,
        kanjiProgs: Number(localStorage.getItem("kanjiProgsV")) || 0
    },

    get(type: "wordCards" | "wordProgs"): number {
        return this._mem[type]
    },

    set(type: "wordCards" | "wordProgs", newVal: number) {
        this._mem[type] = newVal
        localStorage.setItem(`${type}V`, newVal.toString())
    }
}

export default globalVersions
