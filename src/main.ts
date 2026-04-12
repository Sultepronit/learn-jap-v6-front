import "./app.css"

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
import KanjiSearch from "./kanji/dbView/kanji-search"
import KanjiDb from "./kanji/dbView/kanji-db"
import KanjiSessionStats from "./kanji/kanjiSession/kanji-session-stats"
import KanjiCard from "./kanji/kanjiSession/kanji-card"
import KanjiButtons from "./kanji/kanjiSession/kanji-buttons"
import KanjiSession from "./kanji/kanjiSession/kanji-session"

import setMutationsListener from "./sync/localMutations"

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

customElements.define("kanji-search", KanjiSearch)
customElements.define("kanji-db", KanjiDb)

customElements.define("kanji-session-stats", KanjiSessionStats)
customElements.define("kanji-card", KanjiCard)
customElements.define("kanji-buttons", KanjiButtons)
customElements.define("kanji-session", KanjiSession)

// import { parseInitKanjiData } from "./temp-init/parseInitData"
// parseInitKanjiData()

// import loadToServer from "./temp-init/loadToServer"
// loadToServer()

// import { tempClearStore } from "./indexedDB/dbUseCases"
// async function tempClear() {
//     // use localStorage.clear() in the glovalVersions.ts!
//     console.log("clear!")
//     localStorage.clear()
//     // await tempClearStore("wordCards")
//     // tempClearStore("wordProgs")
// }
// await tempClear()

// window.onerror = (message, source, lineno, colno, error) => {
window.onerror = message => {
    alert(message)
}

//test
