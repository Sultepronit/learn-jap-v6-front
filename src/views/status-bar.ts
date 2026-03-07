import { EVT, on } from "../global/events"
import template from "./status-bar.html?raw"

export default class StatusBar extends HTMLElement {
    sync: HTMLDivElement
    connection: HTMLDivElement

    connectedCallback() {
        this.innerHTML = template

        this.sync = this.querySelector<HTMLDivElement>("#sync-status")
        this.connection = this.querySelector<HTMLDivElement>("#connection-status")
        // this.progress.classList.add("pending")

        on(EVT.SYNC_STATUS_CHANGED, (val) => {
            this.sync.className = ""
            if (!val) return
            this.sync.classList.add(val)
        })

        on(EVT.CONNECTION_STATUS_UPDATED, (val) => {
            this.connection.className = ""
            if (!val) return
            this.connection.classList.add(val)
        })
    }


}