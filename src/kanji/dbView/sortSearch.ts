import type { CombinedKanji } from "../types"

const lastSort = {
    column: "num",
    up: false
}

const lastSearch = {
    query: ""
}

export async function sort(data: CombinedKanji[], column: string, up: boolean) {
    console.log(data[0])
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

    switch (column) {
        case "num":
            data.sort((a, b) => a.num - b.num)
            break
        case "kanji":
            data.sort((a, b) => a.id.localeCompare(b.id))
            break
        case "created":
            data.sort((a, b) => a.card.data.created - b.card.data.created)
            break
        case "status":
            data.sort((a, b) => a.prog?.data.status - b.prog?.data.status)
            break
        case "progress":
            data.sort((a, b) => a.prog?.data.progress - b.prog?.data.progress)
            break
        case "record":
            data.sort((a, b) => a.prog?.data.record - b.prog?.data.record)
            break
        case "autorepeat":
            data.sort(
                (a, b) =>
                    Number(a.prog?.data.autorepeat ?? 0) - Number(b.prog?.data.autorepeat ?? 0)
            )
            break
        case "t":
            data.sort((a, b) => a.prog?.data.t - b.prog?.data.t)
            break
        case "readings":
            data.sort((a, b) => a.card?.data.readings.localeCompare(b.card?.data.readings))
            break
        case "main-links":
            data.sort(
                (a, b) => (a.card?.data.links.main[0] || 0) - (b.card?.data.links.main[0] || 0)
            )
            break
        default:
            lastSort.column = ""
            return
    }
    if (!up) data.reverse()
}

function search(data: CombinedKanji[], query: string) {
    return [data.find(k => k.id === query)]
}

export async function rearrangeData(data: CombinedKanji[], query?: string) {
    if (query !== undefined) {
        lastSearch.query = query
    } else {
        query = lastSearch.query
    }
    console.log(query, lastSearch)

    let re: CombinedKanji[]
    if (query) {
        return search(data, query)
    } else {
        re = [...data]
    }
    re = [...data]

    const { column, up } = lastSort
    lastSort.column = "num"
    lastSort.up = true
    await sort(re, column, up)

    return re
}
