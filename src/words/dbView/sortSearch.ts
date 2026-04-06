// import { loadAll } from "../data/data"
import type { CombinedWord } from "../types"

const lastSort = {
    column: "num",
    up: false
}

const lastSearch = {
    query: ""
}

export async function sort(data: CombinedWord[], column: string, up: boolean) {
    // console.log(data[0])
    if (column === lastSort.column) {
        if (up !== lastSort.up) {
            data.reverse()
            lastSort.up = up
        }
        return
    }

    console.log("sorting!")

    lastSort.column = column
    lastSort.up = up

    // if (["writings", "readings"].includes(column)) {
    //     await loadAll("wordCards")
    // } else if (
    //     [
    //         "status",
    //         "f-progress",
    //         "b-progress",
    //         "f-record",
    //         "f-autorepeat",
    //         "b-record",
    //         "b-autorepeat",
    //         "t"
    //     ].includes(column)
    // ) {
    //     await loadAll("wordProgs")
    // }

    switch (column) {
        case "num":
            data.sort((a, b) => a.num - b.num)
            break
        case "status":
            data.sort((a, b) => a.prog?.data.status - b.prog?.data.status)
            break
        case "f-progress":
            data.sort((a, b) => a.prog?.data.f.progress - b.prog?.data.f.progress)
            break
        case "b-progress":
            data.sort((a, b) => a.prog?.data.b.progress - b.prog?.data.b.progress)
            break
        case "f-record":
            data.sort((a, b) => a.prog?.data.f.record - b.prog?.data.f.record)
            break
        case "b-record":
            data.sort((a, b) => a.prog?.data.b.record - b.prog?.data.b.record)
            break
        case "f-autorepeat":
            data.sort(
                (a, b) =>
                    Number(a.prog?.data.f.autorepeat ?? 0) - Number(b.prog?.data.f.autorepeat ?? 0)
            )
            break
        case "b-autorepeat":
            data.sort(
                (a, b) =>
                    Number(a.prog?.data.b.autorepeat ?? 0) - Number(b.prog?.data.b.autorepeat ?? 0)
            )
            break
        case "t":
            data.sort((a, b) => a.prog?.data.t - b.prog?.data.t)
            break
        case "writings":
            data.sort((a, b) =>
                a.card?.data.writings.main[0].localeCompare(b.card?.data.writings.main[0])
            )
            break
        case "readings":
            data.sort((a, b) =>
                a.card?.data.readings.main[0].localeCompare(b.card?.data.readings.main[0])
            )
            break
        default:
            lastSort.column = ""
            return
    }
    if (!up) data.reverse()
}

const rgx = [/[\(\)[\]{}]/g, /\([^)]*\)|\{[^}]*\}|\[[^]]*\]/g]
async function search(data: CombinedWord[], query: string) {
    // await loadAll("wordCards")

    return data.filter(w => {
        const text = [
            ...w.card.data.writings.main,
            ...(w.card.data.writings.rare || []),
            ...w.card.data.readings.main,
            ...(w.card.data.readings.rare || [])
        ].join("")
        if (text.includes(query)) return true

        const hasBrackets = text.includes("(") || text.includes("{") || text.includes("[")
        if (!hasBrackets) return false
        if (text.replace(rgx[0], "").includes(query)) return true
        if (text.replace(rgx[1], "").includes(query)) return true
        return false
        // .includes(query)
    })
}

export async function rearrangeData(data: CombinedWord[], query?: string) {
    if (query !== undefined) {
        lastSearch.query = query
    } else {
        query = lastSearch.query
    }
    console.log(query, lastSearch)

    let re: CombinedWord[]
    if (query) {
        re = await search(data, query)
    } else {
        re = [...data]
    }

    const { column, up } = lastSort
    lastSort.column = "num"
    lastSort.up = true
    await sort(re, column, up)

    return re
}
