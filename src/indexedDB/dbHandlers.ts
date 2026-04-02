type indexDesc = [string, string, IDBIndexParameters]

const stores = [
    {
        name: "wordCards",
        key: "id",
        indexes: [["toSync", "toSync", { unique: false }]] as indexDesc[]
    },
    {
        name: "wordProgs",
        key: "id",
        indexes: [
            ["toSync", "toSync", { unique: false }],
            ["status", "data.status", { unique: false }]
        ] as indexDesc[]
    },
    {
        name: "kanjiCards",
        key: "id",
        indexes: [["toSync", "toSync", { unique: false }]] as indexDesc[]
    },
    {
        name: "kanjiProgs",
        key: "id",
        indexes: [
            ["toSync", "toSync", { unique: false }],
            ["status", "data.status", { unique: false }]
        ] as indexDesc[]
    }
]

function openDB(): Promise<IDBDatabase> {
    return new Promise((res, rej) => {
        // rej("testing reject")
        const req = indexedDB.open("learnJap", 8)

        req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            console.log("upgrade me!")
            const db = (e.target as IDBOpenDBRequest).result
            for (const s of stores) {
                let store: IDBObjectStore
                if (!db.objectStoreNames.contains(s.name)) {
                    store = db.createObjectStore(s.name, { keyPath: s.key })
                } else {
                    store = req.transaction.objectStore(s.name)
                }

                if (!s.indexes) continue
                for (const i of s.indexes) {
                    if (!store.indexNames.contains(i[0])) {
                        store.createIndex(...i)
                    }
                }
                console.log(store)
            }
        }

        req.onsuccess = () => {
            res(req.result)
            console.timeLog("t1", "db opened!")
        }
        req.onerror = () => rej(req.error)

        req.onblocked = () => alert("Доступ заблоковано іншою вкладкою!")
    })
}

const dbPromise = openDB().catch(err => {
    console.warn(err)
    alert("Error opening database")
})

function dbErrorAlert(e: Error) {
    console.warn(e)
    alert(e.message)
}

type DbAction = (store: IDBObjectStore) => IDBRequest
// export async function useDb<T>(storeName: string, mode: IDBTransactionMode, action: DbAction): Promise<T> {
export async function useDb(storeName: string, mode: IDBTransactionMode, action: DbAction) {
    const db = await dbPromise
    if (!db) return null

    return new Promise((res, rej) => {
        const tx = db.transaction(storeName, mode)
        const store = tx.objectStore(storeName)
        const req = action(store)

        req.onsuccess = () => res(req.result)
        req.onerror = () => rej(req.error)

        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    }).catch(dbErrorAlert)
}

export async function putMany(storeName: string, data: any[]) {
    const db = await dbPromise
    if (!db) return null

    return new Promise((res, rej) => {
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)

        for (const entry of data) {
            store.put(entry)
        }

        tx.oncomplete = () => res("success")
        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    }).catch(dbErrorAlert)
}

export async function getIndexed(storeName: string, indexName: string, range?: IDBKeyRange) {
    const db = await dbPromise
    if (!db) return null

    return new Promise((res, rej) => {
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const index = store.index(indexName)

        const req = index.getAll(range)

        req.onsuccess = () => res(req.result)
        req.onerror = () => rej(req.error)

        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    }).catch(dbErrorAlert)
}

export async function getSessionCards(storeName: string, limit = 1000) {
    const db = await dbPromise
    if (!db) return null

    return new Promise((res, rej) => {
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const index = store.index("status")

        const req = index.openCursor(IDBKeyRange.lowerBound(-0.5))

        const re = []
        req.onsuccess = () => {
            const cursor = req.result

            if (!cursor || re.length >= limit) {
                res(re)
                return
            }

            re.push(cursor.value)
            cursor.continue()
        }

        // req.onsuccess = () => res(req.result)
        req.onerror = () => rej(req.error)

        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    }).catch(dbErrorAlert)
}

export async function deleteWordsFromDb(ids: number[]) {
    const db = await dbPromise
    if (!db) return null

    return new Promise((res, rej) => {
        const tx = db.transaction(["wordCards", "wordProgs"], "readwrite")
        const cardsStore = tx.objectStore("wordCards")
        const progsStore = tx.objectStore("wordProgs")

        for (const id of ids) {
            cardsStore.delete(id)
            progsStore.delete(id)
        }

        tx.oncomplete = () => res("success")
        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    }).catch(dbErrorAlert)
}
