import "./app.css"
import setMutationsListener from "./sync/localMutations"
import fetchInitData from "./temp-init/fetchInitData"
import loadToServer from "./temp-init/loadToServer"
import BigTable from "./views/big-table"
import StatusBar from "./views/status-bar"
import { loadAll } from "./words/data/data"
import WordEditor from "./words/dbView/word-editor"
import WordsDb from "./words/dbView/words-db"
import WordsSearch from "./words/dbView/words-search"
import WordButtons from "./words/learnSession/word-buttons"
import WordCard from "./words/learnSession/word-card"
import WordsSession from "./words/learnSession/words-session"
import WordsSessionStats from "./words/learnSession/words-session-stats"

console.time("t1")

setMutationsListener()

customElements.define("status-bar", StatusBar)

customElements.define("big-table", BigTable)

customElements.define("words-search", WordsSearch)
customElements.define("word-editor", WordEditor)
customElements.define("words-db", WordsDb)

customElements.define("words-session-stats", WordsSessionStats)
customElements.define("word-card", WordCard)
customElements.define("word-buttons", WordButtons)
customElements.define("words-session", WordsSession)

// loadAll("wordCards")

// parseInitData()

// loadToServer()
