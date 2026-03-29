export const getNow = () => Math.floor(Date.now() / 1000)

const day = 24 * 60 * 60
export function areSameDay(t1: number, t2: number) {
    return Math.floor(t1 / day) === Math.floor(t2 / day)
}
