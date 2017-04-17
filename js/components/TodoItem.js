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

    // need to figure out why class toggling is not working correctly
    let vnode;

    let viewContent =  h('div.view', [
        h('input.toggle', {attrs: {type: 'checkbox', checked: state.checked}, on: {click: clickHandler.bind(this, component)}}),
        h('label', {attrs: {id: component.id}}, state.content),
        h('button.destroy')
    ]);

    if(!state.completed) {
        vnode = h('li', viewContent);
    } else {
        vnode = h('li.completed', viewContent);
    }

    return vnode;
}

function clickHandler(component) {
    console.log('Someone clicked a todo item!');
    let id = component.id;
    let todoToggleCompletedEvent = {
        channel: "sync",
        topic: `todo.toggle.completed.${id}`,
        eventType: 'click',
        data: {
            id: id,
            content: document.getElementById(id).innerText,
            completed: true
        }
    };

    component.publish(todoToggleCompletedEvent);
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

    publish(event) {
        this.eventStore.add(event);
    }

    render(state) {
        //return patch(this.elm, view(state, this));
        const newVnode = view(state, this);
        this.elm = updateDom(this.elm, newVnode);

        return this.elm;
    }

    reduce(events) {
        return events.reduce(function(state, event){
            if(event.topic === `todo.toggle.completed.${event.data.id}`) {
                state.completed = event.data.completed;
                state.content = event.data.content;
                state.checked = true;

                return state;
            }
        }, {
            content: '',
            completed: false,
            checked: false
        });
    }
}