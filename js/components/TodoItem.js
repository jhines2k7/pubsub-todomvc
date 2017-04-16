let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function view(state) {
    "use strict";

    return h('li', [
        h('div.view', [
            h('input.toggle', {attrs: {type: 'checkbox'}}),
            h('label', state.content),
            h('button.destroy')
        ])
    ]);
}

export default class TodoItemComponent {
    constructor(eventStore, id) {
        this.id = id;
        this.eventStore = eventStore;
    }

    render(state) {
        return patch(view(state), view(state));
    }

    subscribe(channel, topic) {
        let subscription = postal.subscribe({
            channel: channel,
            topic: topic,
            callback: function(data, envelope) {
                let events = this.eventStore.filter(this.subscriptions);

                let reducedState = this.reduce(events);

                this.render(reducedState);
            }.bind(this)
        });

        this.subscriptions[topic] = subscription;

        return subscription;
    }

    reduce(events) {
        return events.reduce(function(state, event){
            state.content = event.data.content;
            state.completed = event.data.completed;

            return state;
        }, {
            content: '',
            completed: false
        });
    }
}