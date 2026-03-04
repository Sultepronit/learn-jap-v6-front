import { getAllCards } from "../indexedDB/dbUseCases";

export default async function loadToServer() {
    const cards = await getAllCards("wordCards") as any[]
    // console.log(cards)
    // const c0 = JSON.stringify(cards.slice(0, 10))
    // localStorage.setItem("c0", c0)

    const apiUrl = import.meta.env.VITE_API_URL
    console.log(apiUrl)

    // const c0 = localStorage.getItem("c0")
    // console.log(JSON.parse(c0))
    const re = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: JSON.stringify(cards)
    })
    
    const j = await re.json()
    console.log(j)
}