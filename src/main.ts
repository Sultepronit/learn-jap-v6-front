import "./app.css"
import setMutationsListener from "./sync/localMutations"
import fetchInitData from "./temp-init/fetchInitData"
import loadToServer from "./temp-init/loadToServer"
import BigTable from "./views/big-table"
import StatusBar from "./views/status-bar"
import WordEditor from "./words/dbView/word-editor"
import WordsDb from "./words/dbView/words-db"
import WordsSearch from "./words/dbView/words-search"
import WordsSession from "./words/learnSession/words-session"

console.time("t1")

setMutationsListener()

customElements.define("status-bar", StatusBar)
customElements.define("big-table", BigTable)
customElements.define("words-search", WordsSearch)
customElements.define("word-editor", WordEditor)
customElements.define("words-db", WordsDb)
customElements.define("words-session", WordsSession)

// parseInitData()

// loadToServer()


