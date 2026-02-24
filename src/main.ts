import "./app.css"
import { useDb } from "./indexedDB/dbHandlers"
import { getAllCards, getCard } from "./indexedDB/dbUseCases"
import fetchInitData from "./temp-init/fetchInitData"
import parseInitData from "./temp-init/parseInitData"
import BigTable from "./views/big-table"
import WordsDb from "./words/dbView/words-db"
import WordsTable from "./words/tableView/words-table"
import type { WordCard } from "./words/types"

console.time("t1")
customElements.define("words-table", WordsTable)
customElements.define("big-table", BigTable)
customElements.define("words-db", WordsDb)
document.createElement("my-component")
// fetchInitData()
// parseInitData()

// const card = await getCard(1000000000001)
// console.log(card)
// console.timeLog("t1", "card is here!")

// const keys = await useDb("wordCards", "readonly", s => s.getAllKeys())
// console.timeLog("t1", "keys are here!")
// console.log(keys)

// const cards = await getAllCards("wordCards") as WordCard[]
// console.timeLog("t1", "cards are here!")
// // console.log(cards)

// const av = new Promise(res => res("test async"))
// const sv = "test sync"

// async function ac() {
//     return await av
// }

// function sc() {
//     return sv
// }

// console.time("t2")
// const pr1 = ac()
// console.log(await pr1)
// console.timeEnd("t2")

// console.time("t21")
// console.log(await pr1)
// console.timeEnd("t21")

// console.time("t3")
// console.log(sc())
// console.timeEnd("t3")

// console.time("t4")
// document.addEventListener("test-event", () => console.log("test event"))
// document.dispatchEvent(new Event("test-event"))
// console.timeEnd("t4")

// const test = { a: null }
// console.log(test)
// console.log(test.a)
// console.log(test.a?.b)
// console.log(test.a?.b.c)
// console.log(test.a?.b.c.join(" "))
// const t = document.createElement("p")
// t.textContent = test.a?.b.c.join(" ")
// console.log(t)
