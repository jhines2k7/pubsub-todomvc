import TodoItemComponent from './TodoItem'

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

    let todoItems = [];

    console.log(state);
    state.todoItems.forEach( (todo) => {
        let todoItemComponent = new TodoItemComponent(component.eventStore, todo.id);

        todoItemComponent.subscribe('sync', `todo.toggle.${todo.id}`);

        todoItems.push(todoItemComponent.render({
            content: todo.content,
            completed: todo.completed
        }));
    });

    return h('section.main', [
        h('input.toggle-all', {attrs: {type: 'checkbox'}}),
        h('label', {attrs: {for: 'toggle-all'}, on: {click: clickHandler.bind(this, component)}}, 'Mark all as complete'),
        h('ul.todo-list', todoItems)
    ]);
}

function clickHandler(component) {
    "use strict";
    console.log('Toggle all selected!');
    // use the event store and some kind of reducer here to get all the todos
    console.log(component.eventStore.events);

    /*let todos = events.reduce( () => {

    });

    let toggleAllEvent = {
        channel: "sync",
        topic: `todo.toggle.all`,
        eventType: 'click',
        data: todos
    };*/

    //component.publish(toggleAllEvent);
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

    publish(events) {
        this.eventStore.add(events);
    }

    reduce(events) {
        return events.reduce(function(state, event){
            state.todoItems = event.data;

            return state;
        }, {
            todoItems: []
        });
    }
}