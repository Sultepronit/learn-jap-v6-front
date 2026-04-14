const syncParams = {
    _mem: JSON.parse(localStorage.getItem("syncParams")) || {
        timeout: 10,
        turnedOn: true
    },

    get timeout(): number {
        return this._mem.timeout
    },

    get turnedOn(): boolean {
        return this._mem.turnedOn
    },

    set(param: "timeout" | "turnedOn", newVal: number | boolean) {
        this._mem[param] = newVal
        localStorage.setItem("syncParams", JSON.stringify(this._mem))
    }
}

export default syncParams
