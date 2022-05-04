document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    Vue.component( 'historicitiness', {
        template: `
            <div class="container">
                <div
                    v-if="weeklyHistories.length > 2"
                    style="text-align: center; font-weight: 700;"
                    @click="showFullHistory = !showFullHistory"
                >
                    {{ showFullHistory ? "show brief history" : "show full history" }}
                </div>
                <div v-for="(weeklyHistory, idx1) in scopedWeeklyHistory" :key="idx1">
                    <hr v-if="idx1>0" />
                    <div class="row">
                        <div class="col">
                            <em>{{ weeklyHistory.when }}</em>
                        </div>
                    </div>
                    <div v-for="(historyAction, idx2) in weeklyHistory.actions" :key="idx2" class="row">
                        <div class="col">
                            {{ historyAction.who }}
                        </div>
                        <div class="col-10">
                            {{ historyAction.what }}
                        </div>
                    </div>
                </div>
            </div>
        `,
        data() {
            return {
                showFullHistory: false,
                weeklyHistories: [
                    {
                        when: 'May Week 01',
                        actions: [
                            { who: 'Sarah', what: 'added summary table'},
                            { who: 'Aaron', what: 'worked deliverables and coding support'},
                            { who: 'Jason', what: 'refactoring'},
                        ]
                    },
                    {
                        when: 'April Week 04',
                        actions: [
                            { who: 'Sarah', what: 'updated faq, added pumped hydropower source to data'},
                            { who: 'Aaron', what: 'presentation refactoring: border, tooltips, background'},
                            { who: 'Jason', what: 'cleaned up ui / refactoring, bug fixes'},
                        ]
                    },
                    {
                        when: 'April Week 03',
                        actions: [
                            { who: 'Sarah', what: 'updated vis handling of "actual" data set'},
                            { who: 'Aaron', what: 'added faq, added map dots, updated tooltips and light refactor of backing javascript for vis'},
                            { who: 'Jason', what: 'refactoring'},
                        ]
                    },
                    {
                        when: 'April Week 02',
                        actions: [
                            { who: 'Sarah', what: 'toggle bar chart between actual and potential'},
                            { who: 'Aaron', what: 'bug fixes, power plant display/coloring, zoom fixes, minor graphics tweaks, tooltip updates'},
                            { who: 'Jason', what: 'bug fixes, legend filtering/coloring,barchart/map/dropdown interactions'},
                        ]
                    },
                    {
                        when: 'April Week 01',
                        actions: [
                            { who: 'Sarah', what: 'analysis documentation review and vis bug fixes'},
                            { who: 'Aaron', what: 'visualization bug fixes'},
                            { who: 'Jason', what: 'bug fixes + refactored legend'},
                        ]
                    },
                    {
                        when: 'March Week 05',
                        actions: [
                            { who: 'Sarah', what: 'further worked the bar chart'},
                            { who: 'Aaron', what: 'geo map refactor'},
                            { who: 'Jason', what: 'general refactor + various bugs'},
                        ]
                    },
                    {
                        when: 'March Week 04',
                        actions: [
                            { who: 'Sarah', what: 'enhanced the bar chart [data + axis labeling]'},
                            { who: 'Aaron', what: 'bootstrap [borders + general presentation]'},
                            { who: 'Jason', what: 'geolocation (initial) + vis history'},
                        ]
                    }
                ]
            }
        },
        computed: {
            scopedWeeklyHistory: {
                get(){
                    let full_history = this.weeklyHistories;
                    if (this.showFullHistory) {
                        return full_history;
                    } else {
                        let brief_history = full_history.filter( (_h,i) => i < 3);
                        return brief_history;
                    }
                },
                set(){}
            }
        }
    });

    new Vue({ el: '#history-modal-body' })

});
