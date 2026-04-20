import { EVT, on } from "../../global/events"

let loudnessOn = false
const audio = new Audio()
const url = "https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kana="

on(EVT.LOUDNESS_TOGGLED, val => {
    loudnessOn = val
    if (loudnessOn) playNext()
})

audio.onerror = e => console.warn(e)

audio.oncanplay = () => {
    if (audio.duration > 5) {
        console.log("No Pronunciation!")
        audio.dispatchEvent(new Event("ended"))
    } else {
        audio.play().catch(err => console.warn(err))
    }
}

audio.onended = playNext

let variants: string[] = []
let kanji = ""
let vIdx = 0
function playNext() {
    if (vIdx >= variants.length) return
    // console.log(variants, kanji, vIdx)
    const src = `${url}${variants[vIdx++]}&kanji=${kanji}`
    // const src = `${url}${variants[vIdx]}`
    console.log(src)

    audio.src = src
}

export default function pronouce(newWord: { kanji: string; variants: string[] }) {
    // console.log("set pronunciation!", newWord.kanji)
    vIdx = 0
    // if (newWord) {
    kanji = newWord.kanji
    variants = newWord.variants
    // }
    if (loudnessOn) playNext()
}
