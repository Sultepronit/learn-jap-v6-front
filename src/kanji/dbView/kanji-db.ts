import "./kanji-db.css"
import type BigTable from "../../views/big-table"
import type { CombinedKanji } from "../types"
import { loadAllProgs, loadBasicList } from "../data/data"
import fillRow from "./fillBTRow"
import { EVT, on } from "../../global/events"
import { rearrangeData, sort } from "./sortSearch"
import type KanjiSearch from "./kanji-search"
import collectKanji from "../data/collector"

export default class KanjiDb extends HTMLElement {
    allData: CombinedKanji[]
    displayData: CombinedKanji[]

    searchBar: KanjiSearch
    table: BigTable

    sortType = ""
    searching = false

    async connectedCallback() {
        this.allData = await loadBasicList()
        this.render()

        this.setSearchBar()
        this.setTable()

        this.querySelector("#collect-kanji").addEventListener("click", async () => {
            collectKanji()
        })

        on(EVT.KANJI_COUNT_CHANGED, async () => {
            this.updateDisplayData(await rearrangeData(this.allData))
            this.dispatchEvent(
                new CustomEvent("card-selected", {
                    detail: { cardNum: this.allData.length, rowIdx: 0 }
                })
            )
        })

        on(EVT.KANJI_UPDATES_RECEIVED, async ({ type }) => {
            console.log(type)
            if (type === this.sortType) {
                this.updateDisplayData(await rearrangeData(this.allData))
            } /*else if (this.searching && type === "kanjiCards") {
                // WE REALLY DO NEED THIS?
                this.updateDisplayData(await rearrangeData(this.allData))
            }*/
        })
    }

    render() {
        this.innerHTML = `
            <div class="kdb-controls-pannel">
                <kanji-search></kanji-search>
                <button class="emo-button" id="collect-kanji">⬇️</button>
            </div>
            <big-table></big-table>`
    }

    updateDisplayData(value: CombinedKanji[]) {
        this.displayData = value
        // console.log(this.displayData)
        this.table.setData(this.displayData)
        this.searchBar.update(this.displayData)
    }

    setSearchBar() {
        this.searchBar = this.querySelector("kanji-search")
        this.searchBar.setData(this.allData)

        this.addEventListener("search", async (e: CustomEvent) => {
            this.searching = !!e.detail.query
            // await loadAll("wordCards")
            this.updateDisplayData(await rearrangeData(this.allData, e.detail.query))
        })
    }

    async setTable() {
        const colums = [
            // "num",
            "kanji",
            "created",
            "status",
            "progress",
            "record",
            "autorepeat",
            "t",
            "readings",
            "main-links",
            "other-links"
        ]
        this.table = this.querySelector("big-table")
        // console.log(this.table)
        console.timeLog("t1", "table!")
        this.table.setParams(colums, "kanji-btr", fillRow, EVT.KANJI_UPDATED)
        this.updateDisplayData(await rearrangeData(this.allData))

        this.dispatchEvent(
            new CustomEvent("card-selected", {
                detail: { cardNum: this.allData.length, rowIdx: 0 }
            })
        )

        this.table.addEventListener("sort", async (e: CustomEvent) => {
            const { column, up } = e.detail
            console.log(column, up)

            if (["readings", "main-links"].includes(column)) {
                this.sortType = "kanjiCards"
            } else if (["status", "progress", "record", "autorepeat", "t"].includes(column)) {
                await loadAllProgs()
                this.sortType = "kanjiProgs"
            } else {
                this.sortType = ""
            }
            console.log(this.sortType)

            await sort(this.displayData, column, up)
            this.updateDisplayData(this.displayData)
        })
    }
}
