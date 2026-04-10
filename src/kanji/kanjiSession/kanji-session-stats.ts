import template from "./kanji-session-stats.html?raw"

import BaseComponent from "../../global/BaseComponent"
import { EVT, on } from "../../global/events"
import type { KanjiSession } from "./sessionData"

type RefKeys = "plan" | "clicks" | "results" | "learnPlan" | "repeatPlan"
export default class KanjiSessionStats extends BaseComponent<RefKeys> {
    connectedCallback() {
        this.innerHTML = template

        this.collectRefs()

        on(EVT.KS.STATS_UPDATED, s => this.update(s))
    }

    update(s: KanjiSession) {
        // console.log(s)
        this.refs.plan.text(s.plan.total)
        this.refs.clicks.text(s.stats.tries)
        this.refs.results.text(s.stats.results)
        this.refs.learnPlan.text(s.plan.learn)
        this.refs.repeatPlan.text(s.plan.repeat)

        this.refs["learnSoSo"].text(s.stats.learn.pass + s.stats.learn.retry)
        this.refs["learnGood"].text(s.stats.learn.good)
        this.refs["learnDegrade"].text(-s.stats.learn.bad || "")

        this.refs["repeatSoSo"].text(s.stats.repeat.pass + s.stats.repeat.retry)
        this.refs["repeatGood"].text(s.stats.repeat.good)
        this.refs["repeatDegrade"].text(-s.stats.repeat.bad || "")

        this.refs["autorepeat"].text(s.stats.autorepeated || "")
    }
}
