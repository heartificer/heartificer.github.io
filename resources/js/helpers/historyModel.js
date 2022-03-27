document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    Vue.component( 'historicitiness', {
        template: `
            <div class="container">
                <div v-for="(weeklyHistory, idx1) in weeklyHistories" :key="idx1">
                    <hr v-if="idx==0" />
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
                        when: 'March Week 05',
                        actions: [
                            { who: 'Sarah', what: 'further worked the bar chart'},
                            { who: 'Aaron', what: 'geo map refactor'},
                            { who: 'Jason', what: 'general refactor'},
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
