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

function view() {
    "use strict";

    return h('footer.footer', [
        h('span.todo-count', [
            h('strong', '0 items left')
        ]),
        h('ul.filters', [
            h('li', [h('a.selected', {props: {href: '#/'}, on: {click: clickHandler.bind(null)}}, 'All')]),
            h('li', [h('a', {props: {href: '#/active'}}, 'Active')]),
            h('li', [h('a', {props: {href: '#/completed'}}, 'Completed')])
        ]),
        // Hidden if no completed items are left
        h('button.clear-completed', 'Clear completed')
    ]);
}

function clickHandler(component) {
    console.log('Someone clicked me!');
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
                    this.render();
                }
            }.bind(this)
        });

        this.subscriptions[topic] = subscription;

        return subscription;
    }

    render() {
        return patch(this.container, view());
    }
}