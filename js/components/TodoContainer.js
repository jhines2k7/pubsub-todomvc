import TodoItemComponent from './TodoItem'

let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

import postal from 'postal/lib/postal.lodash'

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function view(state, component) {
    "use strict";

    let todoItems = [];

    console.log(state);
    state.todoItems.forEach( (content) => {
        let todoItemComponent = new TodoItemComponent(component.eventStore, guid())

        todoItemComponent.subscribe('sync', 'todo.toggle.completed');

        todoItems.push(todoItemComponent.render({
            content: content,
            completed: false
        }));
    });

    return h('section.main', [
        h('input.toggle-all', {attrs: {type: 'checkbox'}}),
        h('label', {attrs: {for: 'toggle-all'}}, 'Mark all as complete'),
        h('ul.todo-list', todoItems)
    ]);
}

function updateDom(container, newVnode) {
    "use strict";

    return patch(container, newVnode);
}

export default class TodoContainerComponent {
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

                let reducedState = this.reduce(events);

                if(events.length > 0) {
                    this.render(reducedState);
                }

            }.bind(this)
        });

        this.subscriptions[topic] = subscription;

        return subscription;
    }

    render(state) {
        const newVnode = view(state, this);
        this.container = updateDom(this.container, newVnode);

        return this.container;
    }

    reduce(events) {
        return events.reduce(function(state, event){
            state.todoItems.push(event.data.content);

            return state;
        }, {
            todoItems: []
        });
    }
}