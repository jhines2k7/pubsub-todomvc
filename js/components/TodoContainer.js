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

    let liNodes = state.todos.map( (todo) => {
        return h('li', {attrs: {id: todo.id}, class: {completed: todo.completed}}, [
            h('div.view', [
                h('input.toggle', {attrs: {type: 'checkbox', checked: todo.completed}, on: {click: toggleTodoClickHandler.bind(null, component, todo.id, todo.completed)}}),
                h('label', todo.content),
                h('button.destroy')
            ])
        ]);
    });

    return h('section.main', [
        h('input.toggle-all', {attrs: {type: 'checkbox'}}),
        h('label', {attrs: {for: 'toggle-all'}, on: {click: toggleAllClickHandler.bind(null, component)}}, 'Mark all as complete'),
        h('ul.todo-list', liNodes)
    ]);
}

function toggleTodoClickHandler(component, id, completed) {
    "use strict";
    let lastToggleEvent = component.eventStore.events.filter( (event) => {
        return event.topic === 'todo.add' || event.topic === 'todo.toggle' || event.topic === 'todo.toggle.all';
    }).pop();

    let todos = [];

    if(lastToggleEvent){
        todos = lastToggleEvent.data.todos.map( (todo) => {
            if(todo.id === id) {
                todo.completed = !completed;
            }

            return todo;
        });
    } else {
        let lastAddEvent = component.eventStore.events.filter( (event) => {
            return event.topic === 'todo.add';
        }).pop();

        log("INFO", lastAddEvent);

        todos = lastAddEvent.data.todos.map( (todo) => {
            if(todo.id === id) {
                todo.completed = !completed;
            }

            return todo;
        });
    }

    let todoToggleEvent = {
        channel: "sync",
        topic: `todo.toggle`,
        eventType: 'click',
        data: {
            todos: todos,
            completedItems: !completed === true ? 1 : -1,
            itemsLeft: !completed === true ? -1 : 1
        }
    };

    component.publish(todoToggleEvent);
}

function toggleAllClickHandler(component) {
    "use strict";

    let lastTodoEvent = component.eventStore.events.filter( (event) => {
        return event.topic === 'todo.add' || event.topic === 'todo.toggle' || event.topic === 'todo.toggle.all';
    }).pop();

    let atLeastOneIncomplete = lastTodoEvent.data.todos.find( (todo) => {
        return todo.completed === false;
    });

    let markAllComplete = false;

    if(typeof atLeastOneIncomplete !== 'undefined') {
        markAllComplete = true;
    }

    let todos = lastTodoEvent.data.todos.map( (todo) => {
        return {
            id: todo.id,
            content: todo.content,
            completed: markAllComplete
        };
    });

    let toggleAllEvent = {
        channel: "sync",
        topic: 'todo.toggle.all',
        eventType: 'click',
        data: {
            todos: todos,
            itemsLeft: markAllComplete === true ? 0 : todos.length,
            completedItems: markAllComplete === true ? todos.length : 0
        }
    };

    component.publish(toggleAllEvent);
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
        this.container = patch(this.container, newVnode);

        return this.container;
    }

    publish(events) {
        this.eventStore.add(events);
    }

    reduce(events) {
        return events.reduce(function(state, event){
            state.todos = event.data.todos;

            return state;
        }, {
            todos: []
        });
    }
}