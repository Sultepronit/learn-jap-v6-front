import { getCard, useDb } from "./indexedDB/dbHandlers"
import { getAllCards } from "./indexedDB/dbUseCases"
import fetchInitData from "./temp-init/fetchInitData"
import parseInitData from "./temp-init/parseInitData"
import type { WordCard } from "./types/types"

// fetchInitData()
// parseInitData()
console.time("t1")
const card = await getCard(1000000000001)
console.log(card)
console.timeLog("t1", "card is here!")
const cards = await getAllCards("wordCards") as WordCard[]
console.timeLog("t1", "cards are here!")
console.log(cards)
const keys = await useDb("wordCards", "readonly", s => s.getAllKeys())
console.timeLog("t1", "keys are here!")
console.log(keys)