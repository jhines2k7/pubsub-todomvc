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

function view(state, component) {
    "use strict";

    return h('li', {attrs: {id: component.id}, class: {completed: state.completed}}, [
        h('div.view', [
            h('input.toggle', {attrs: {type: 'checkbox', checked: state.completed}, on: {click: clickHandler.bind(this, component, state.completed)}}),
            h('label', state.content),
            h('button.destroy')
        ])
    ]);
}

function clickHandler(component, completed) {
    console.log('Someone clicked a todo item!');
    let id = component.id;
    let todoToggleCompletedEvent = {
        channel: "sync",
        topic: `todo.toggle.${id}`,
        eventType: 'click',
        data: {
            id: id,
            content: document.getElementById(id).innerText,
            completed: !completed
        }
    };

    let toggleCompleteEvent = {
        channel: "sync",
        topic: 'todo.complete.toggled',
        eventType: 'click',
        data: {
            completed: !completed
        }
    };

    component.publish([todoToggleCompletedEvent, toggleCompleteEvent]);
}

function updateDom(container, newVnode) {
    "use strict";

    return patch(container, newVnode);
}

export default class TodoItemComponent {
    constructor(eventStore, id) {
        this.id = id;
        this.eventStore = eventStore;
        this.subscriptions = {};
        this.elm = document.createElement('li');
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

    publish(events) {
        this.eventStore.add(events);
    }

    render(state) {
        const newVnode = view(state, this);
        this.elm = updateDom(this.elm, newVnode);

        return this.elm;
    }

    reduce(events) {
        return events.reduce(function(state, event){
            if(event.topic === `todo.toggle.${event.data.id}`) {
                state.completed = event.data.completed;
                state.content = event.data.content;

                return state;
            }
        }, {
            content: '',
            completed: false
        });
    }
}