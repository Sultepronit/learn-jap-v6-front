const globalVersions = {
    _mem: {
        wordCards: Number(localStorage.getItem("wordCardsV")) || -1
    },

    get(group: string) {
        return this._mem[group]
    },

    set(group: string, newVal: number) {
        this._mem[group] = newVal
        localStorage.setItem("wordCardsV", newVal.toString())
    }
}

export default globalVersions