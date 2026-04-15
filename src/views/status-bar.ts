import { EVT, on } from "../global/events"
import syncParams from "../global/syncParams"
import template from "./status-bar.html?raw"

export default class StatusBar extends HTMLElement {
    sync: HTMLDivElement
    connection: HTMLDivElement

    connectedCallback() {
        this.innerHTML = template

        this.sync = this.querySelector<HTMLDivElement>("#sync-status")
        this.connection = this.querySelector<HTMLDivElement>("#connection-status")
        // this.progress.classList.add("pending")

        if (!syncParams.turnedOn) this.sync.classList.add("turned-off")

        on(EVT.SYNC_STATUS_CHANGED, val => {
            if (!syncParams.turnedOn) {
                this.sync.classList.add("turned-off")
                return
            }
            // this.sync.className = ""
            // if (!val) return
            // this.sync.classList.add(val)
            this.sync.className = val
        })

        on(EVT.CONNECTION_STATUS_CHANGED, val => {
            this.connection.className = ""
            if (!val) return
            this.connection.classList.add(val)
        })
    }
}
