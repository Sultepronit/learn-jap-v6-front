import { loadAll } from "../data/data"
import type { CombinedWord } from "../types"

const lastSort = {
    column: "num",
    up: false
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
    
    if (["writings", "readings"].includes(column)) {
        await loadAll("wordCards")
    } else if (["status"].includes(column)) {
        await loadAll("wordProgs")
    }

    switch (column) {
        case "num":
            data.sort((a, b) => a.num - b.num)
            break
        case "status":
            data.sort((a, b) =>
                a.prog?.data.status - b.prog?.data.status)
            break
        case "writings":
            data.sort((a, b) =>
                a.card?.data.writings.main[0].localeCompare(b.card?.data.writings.main[0]))
            break
        case "readings":
            data.sort((a, b) =>
                a.card?.data.readings.main[0].localeCompare(b.card?.data.readings.main[0]))
            break
    }
    if (!up) data.reverse();
}

async function search(data: CombinedWord[], query: string) {
    await loadAll("wordCards")
    return data.filter(w => {
        return [
            ...w.card.data.writings.main,
            ...(w.card.data.writings.rare || []),
            ...w.card.data.readings.main,
            ...(w.card.data.readings.rare || []),
        ].join("").includes(query)
    })
}

export async function searchSort(data: CombinedWord[], query: string) {
    let re: CombinedWord[]
    
    if (query) {
        re = await search(data, query)
    } else {
        re = [...data]
    }
    console.log(query)

    const { column, up } = lastSort
    lastSort.column = "num"
    lastSort.up = true
    await sort(re, column, up)

    return re
}