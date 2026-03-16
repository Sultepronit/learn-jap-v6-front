const deletedWords = {
    _mem: JSON.parse(localStorage.getItem("deletedWords")),

    get() {
        // console.log(this._mem)
        return this._mem
    },

    add(id: number) {
        this._mem ? this._mem.push(id) : this._mem = [id]
        console.log(this._mem)
        localStorage.setItem("deletedWords", JSON.stringify(this._mem))
    }
}

export default deletedWords