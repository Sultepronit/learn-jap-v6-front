const globalVersions = {
    _mem: {
        wordCards: Number(localStorage.getItem("wordCardsV")) || -1,
        wordProgs: Number(localStorage.getItem("wordProgsV")) || -1
    },

    get(type: string) {
        return this._mem[type]
    },

    set(type: string, newVal: number) {
        this._mem[type] = newVal
        localStorage.setItem(`${type}V`, newVal.toString())
    }
}

export default globalVersions