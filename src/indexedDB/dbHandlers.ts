const stores = [
    { name: "wordCards", key: "id" },
    { name: "wordStats", key: "id" }
]

function openDB(): Promise<IDBDatabase> {
    return new Promise((res, rej) => {
        // rej("testing regect")
        const req = indexedDB.open("learnJap", 2)

        req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            console.log("upgrade me!")
            const db = (e.target as IDBOpenDBRequest).result
            for (const store of stores) {
                if (!db.objectStoreNames.contains(store.name)) {
                    db.createObjectStore(store.name, { keyPath: store.key })
                }
            }
        }

        req.onsuccess = () => {
            res(req.result)
            console.timeLog("t1", "db opened!")
        }
        req.onerror = () => rej(req.error)
    })
}

const dbPromise = openDB().catch(err => {
    console.warn(err)
    alert("Error opening database")
})

// async function initTx(storeName: string, mode: IDBTransactionMode) {
//     const db = await dbPromise
//     if (!db) return null
    
//     const tx = db.transaction(storeName, mode)
//     const store = tx.objectStore(storeName)
//     return { tx, store }
// }

// type GetAction = "get" | "getAll" | "getKey" | "getAllKeys"
// async function getFromDb(storeName: string, action: GetAction, arg: any) {
//     const ir = await initTx(storeName, "readonly")
//     if (!ir) return null

//     const { store } = ir
//     return new Promise((res, rej) => {
//         const req = store[action](arg)
//         req.onsuccess = () => res(req.result)
//         req.onerror = () => rej(req.error)
//     })
// }

type DbAction = (store: IDBObjectStore) => IDBRequest
export async function useDb<T>(storeName: string, mode: IDBTransactionMode, action: DbAction): Promise<T> {
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
    })
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

        tx.oncomplete = res
        tx.onerror = () => rej(tx.error)
        tx.onabort = () => rej(new Error("Transaction aborted!"))
    })
}