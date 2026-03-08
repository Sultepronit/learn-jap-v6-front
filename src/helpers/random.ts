export function genRandomInt(maxExc: number) {
    return Math.floor(Math.random() * maxExc)
}

export function randomize(arr: any[]) {
    const limit = arr.length * 0.8
    for (let i = 0; i < limit; i++) {
        const ri = genRandomInt(arr.length)
        // console.log(i, ri)
        if (ri === i) continue
        const current = arr[i]
        arr[i] = arr[ri]
        arr[ri] = current
    }
}