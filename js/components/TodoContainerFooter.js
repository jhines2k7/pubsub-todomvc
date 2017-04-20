let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/eventlisteners').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

import postal from 'postal/lib/postal.lodash'

function view(state) {
    "use strict";

    return h('footer.footer', [
        h('span.todo-count', [
            h('strong', `${state.itemsLeft} ${state.itemsLeft !== 1 ? 'items' : 'item'} left`)
        ]),
        h('ul.filters', [
            h('li', [h('a.selected', {props: {href: '#/'}, on: {click: clickHandler.bind(null)}}, 'All')]),
            h('li', [h('a', {props: {href: '#/active'}}, 'Active')]),
            h('li', [h('a', {props: {href: '#/completed'}}, 'Completed')])
        ]),
        // Hidden if no completed items are left
        state.completedItems > 0 ? h('button.clear-completed', 'Clear completed') : null
    ]);
}

function clickHandler(component) {
    console.log('Someone clicked me!');
}

function updateDom(container, newVnode) {
    "use strict";

    return patch(container, newVnode);
}

export default class TodoContainerFooter {
    constructor(container, eventStore) {
        this.container = container;
        this.eventStore = eventStore;
        this.subscriptions = {};
    }

    subscribe(channel, topic) {
        let subscription = postal.subscribe({
            channel: channel,
            topic: topic,
            callback: function(data, envelope) {
                let events = this.eventStore.filter(this.subscriptions);

                if(events.length > 0) {
                    let reducedState = this.reduce(events);
                    this.render(reducedState);
                }
            }.bind(this)
        });

        this.subscriptions[topic] = subscription;

        return subscription;
    }

    render(state) {
        //return patch(this.container, view(state));
        const newVnode = view(state);
        this.container = updateDom(this.container, newVnode);

        return this.container;
    }

    reduce(events) {
        return events.reduce(function(state, event){
            if(event.topic === 'todo.add') {
                state.itemsLeft += event.data.itemsLeft;

                return state;
            } else if(event.topic === 'todo.toggle.complete') {
                state.completedItems += event.data.completedItems;
                state.itemsLeft += event.data.completedItems;

                return state;
            } else if(event.topic === 'todo.toggle.incomplete') {
                state.completedItems += event.data.completedItems;
                state.itemsLeft += event.data.completedItems;

                return state;
            }
        }, {
            itemsLeft: 0,
            completedItems: 0
        });
    }
}