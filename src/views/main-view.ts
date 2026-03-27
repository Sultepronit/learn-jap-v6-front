import template from "./main-view.html?raw"

export default class MainView extends HTMLElement {
    views: Record<string, HTMLElement> = {
        menu: null,
        "#words-db": null,
        "#words-session": null
    }
    activeView: HTMLElement

    connectedCallback() {
        this.innerHTML = template

        this.views.menu = this.querySelector("#menu")
        this.activeView = this.views.menu

        this.navigate()
        window.addEventListener("hashchange", () => this.navigate())
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
}
