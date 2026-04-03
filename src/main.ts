import "./app.css"
// import { tempClearStore } from "./indexedDB/dbUseCases"

// async function tempClear() {
//     // use localStorage.clear() in the glovalVersions.ts!
//     console.log("clear!")
//     localStorage.clear()
//     // await tempClearStore("wordCards")
//     // tempClearStore("wordProgs")
// }
// await tempClear()

import setMutationsListener from "./sync/localMutations"

import MainView from "./views/main-view"
import StatusBar from "./views/status-bar"
import ControlsSlider from "./views/controls-slider"
import BigTable from "./views/big-table"
import WordEditor from "./words/dbView/word-editor"
import WordsDb from "./words/dbView/words-db"
import WordsSearch from "./words/dbView/words-search"
import WordButtons from "./words/learnSession/word-buttons"
import WordCard from "./words/learnSession/word-card"
import WordsSession from "./words/learnSession/words-session"
import WordsSessionStats from "./words/learnSession/words-session-stats"
import fetchInitData from "./temp-init/fetchInitData"
import { parseInitKanjiData } from "./temp-init/parseInitData"
import { loadBasicList } from "./kanji/data/data"
import KanjiDb from "./kanji/dbView/kanji-db"

console.time("t1")

setMutationsListener()

customElements.define("main-view", MainView)
customElements.define("status-bar", StatusBar)
customElements.define("controls-slider", ControlsSlider)

customElements.define("big-table", BigTable)

customElements.define("words-search", WordsSearch)
customElements.define("word-editor", WordEditor)
customElements.define("words-db", WordsDb)

customElements.define("words-session-stats", WordsSessionStats)
customElements.define("word-card", WordCard)
customElements.define("word-buttons", WordButtons)
customElements.define("words-session", WordsSession)

customElements.define("kanji-db", KanjiDb)

// fetchInitData()
// parseInitKanjiData()
// parseInitData()

// loadToServer()

// window.onerror = (message, source, lineno, colno, error) => {
window.onerror = message => {
    alert(message)
}

//test
// loadBasicList()
