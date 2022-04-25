document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    Vue.component( 'historicitiness', {
        template: `
            <div class="container">
                <div v-for="(weeklyHistory, idx1) in weeklyHistories" :key="idx1">
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
                weeklyHistories: [
                    {
                        when: 'April Week 03',
                        actions: [
                            { who: 'Sarah', what: 'updated vis handling of "actua" data set'},
                            { who: 'Aaron', what: 'added faq, updated tooltips and light refactor of backing javascript for vis'},
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
        }
    });

    new Vue({ el: '#history-modal-body' })

});
