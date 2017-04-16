let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/eventlisteners').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

import postal from 'postal/lib/postal.lodash'

function view(state, component) {
    "use strict";

    return h('li', {class: {toggle: state.completed}}, [
        h('div.view', [
            h('input.toggle', {attrs: {type: 'checkbox'}, on: {click: clickHandler.bind(null, component)}}),
            h('label', state.content),
            h('button.destroy')
        ])
    ]);
}

function clickHandler(component) {
    let todoToggleCompletedEvent = {
        channel: "sync",
        topic: "todo.toggle.completed",
        eventType: 'click',
        data: {
            id: component.id,
            completed: true
        }
    };

    component.publish(todoToggleCompletedEvent);
}

export default class TodoItemComponent {
    constructor(eventStore, id) {
        this.id = id;
        this.eventStore = eventStore;
        this.subscriptions = {};
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

    render(state) {
        return patch(view(state, this), view(state, this));
    }

    reduce(events) {
        return events.reduce(function(state, event){
            if(event.topic === 'todo.toggle.completed' && event.data.id === this.id) {
                state.completed = event.data.completed;

                return state;
            } else {
                state.content = event.data.content;

                return state;
            }
        }, {
            content: '',
            completed: false
        });
    }
}