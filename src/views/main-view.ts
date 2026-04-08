import { emit, EVT, on } from "../global/events"
import template from "./main-view.html?raw"

export default class MainView extends HTMLElement {
    views: Record<string, HTMLElement> = {
        menu: null,
        "#words-db": null,
        "#words-session": null,
        "#kanji-db": null,
        "#kanji-session": null
    }
    activeView: HTMLElement
    login: HTMLInputElement

    connectedCallback() {
        this.innerHTML = template

        this.views.menu = this.querySelector("#menu")
        this.activeView = this.views.menu

        this.navigate()
        window.addEventListener("hashchange", () => this.navigate())

        this.checkLogin()
    }

    navigate() {
        const path = location.hash
        let view = this.views[path]
        if (view === undefined) view = this.views.menu
        if (view === this.activeView) return

        if (view === null) {
            const tag = path.substring(1)
            view = this.views[path] = document.createElement(tag)
            this.appendChild(view)
        }

        this.activeView.classList.add("hidden")
        this.activeView = view
        this.activeView.classList.remove("hidden")
    }

    checkLogin() {
        const api = localStorage.getItem("api")
        if (api) return

        this.activeView.classList.add("hidden")

        this.login = this.querySelector<HTMLInputElement>("#login")
        this.login.classList.remove("hidden")
        this.login.addEventListener("change", () => {
            emit(EVT.LOGIN, `https://${this.login.value}`)
        })
        this.checkInput()
    }

    checkInput() {
        on(
            EVT.SYNC_STATUS_CHANGED,
            msg => {
                if (msg === "fulfilled") {
                    localStorage.setItem("api", `https://${this.login.value}`)
                    this.login.remove()
                    this.login = null
                    this.activeView.classList.remove("hidden")
                } else {
                    this.checkInput()
                }
            },
            true
        )
    }
}
