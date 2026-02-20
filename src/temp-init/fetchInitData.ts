export default async function fetchInitData() {
    try {
        const url = import.meta.env.VITE_INIT_DATA_URL
        console.log(url)
        const resp = await fetch(url)
        const data = await resp.json()
        localStorage.setItem('initData', JSON.stringify(data))
        console.log(data)
        return data 
    } catch (error) {
        console.warn(error)
    }
}