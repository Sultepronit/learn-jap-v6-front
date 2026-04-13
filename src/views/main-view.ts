import { emit, EVT, on } from "../global/events"
import type { BigView } from "../global/types"
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

    hideActive() {
        this.activeView.classList.add("hidden")
        console.log("hide", this.activeView.localName)
        emit(EVT.VIEW_HIDDEN, this.activeView.localName as BigView)
    }

    showActive() {
        this.activeView.classList.remove("hidden")
        console.log("show", this.activeView.localName)
        setTimeout(() => emit(EVT.VIEW_SHOWN, this.activeView.localName as BigView), 50)
        // emit(EVT.VIEW_SHOWN, this.activeView.localName as BigView)
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

        this.hideActive()
        this.activeView = view
        this.showActive()
    }

    checkLogin() {
        const api = localStorage.getItem("api")
        if (api) return

        // this.activeView.classList.add("hidden")
        this.hideActive()

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
                    // this.activeView.classList.remove("hidden")
                    this.showActive()
                } else {
                    this.checkInput()
                }
            },
            true
        )
    }
}
