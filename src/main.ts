import "./app.css"
import { useDb } from "./indexedDB/dbHandlers"
import setMutationsListener from "./sync/localMutations"
import fetchInitData from "./temp-init/fetchInitData"
import loadToServer from "./temp-init/loadToServer"
import parseInitData from "./temp-init/parseInitData"
import BigTable from "./views/big-table"
import WordEditor from "./words/dbView/word-editor"
import WordsDb from "./words/dbView/words-db"
// import WordsTable from "./words/tableView/words-table"
import type { WordCard } from "./words/types"

console.time("t1")

// setMutationsListener()

// // customElements.define("words-table", WordsTable)
// customElements.define("big-table", BigTable)
// customElements.define("word-editor", WordEditor)
// customElements.define("words-db", WordsDb)

// fetchInitData()
// parseInitData()

loadToServer()


