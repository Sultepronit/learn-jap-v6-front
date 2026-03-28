import { getAllCards } from "../indexedDB/dbUseCases"

export default async function loadToServer() {
    // return
    // const cards = (await getAllCards("wordCards")) as any[]
    const cards = await getAllCards("wordProgs") as any[]
    // console.log(cards)

    const apiUrl = import.meta.env.VITE_API_URL
    console.log(apiUrl)

    // const url = `${apiUrl}/upload?table=words&group=card`
    const url = `${apiUrl}/upload?table=words&group=prog`
    const re = await fetch(url, {
        method: "POST",
        body: JSON.stringify(cards)
    })

    const j = await re.text()
    console.log(j)
}
