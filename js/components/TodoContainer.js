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
        h('label', {attrs: {for: 'toggle-all'}, on: {click: toggleAllClickHandler.bind(null, component, state.markAllComplete)}}, 'Mark all as complete'),
        h('ul.todo-list', liNodes)
    ]);
}

function toggleTodoClickHandler(component, id, completed) {
    "use strict";
    console.log(component.eventStore.events);
    let lastToggleEvent = component.eventStore.events.filter( (event) => {
        return event.topic === 'todo.toggle';
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

        todos = lastAddEvent.data.todos.map( (todo) => {
            if(todo.id === id) {
                todo.completed = !completed;
            }

            return todo;
        });
    }

    let todoToggleEvent;

    if(!completed === true) {
        todoToggleEvent = {
            channel: "sync",
            topic: `todo.toggle.complete`,
            eventType: 'click',
            data: {
                todos: todos,
                completedItems: 1,
                itemsLeft: -1
            }
        };

        component.publish([todoToggleEvent]);
    } else {
        todoToggleEvent = {
            channel: "sync",
            topic: `todo.toggle.incomplete`,
            eventType: 'click',
            data: {
                todos: todos,
                completedItems: -1,
                itemsLeft: 1
            }
        };

        component.publish(todoToggleEvent);
    }

    /*let toggleCompleteEvent = {
        channel: "sync",
        topic: 'todo.complete.toggled',
        eventType: 'click',
        data: {
            numTodos: todos.length,
            completed: !completed
        }
    };*/
}

function toggleAllClickHandler(component, markAllComplete) {
    "use strict";

    let lastAddEvent = component.eventStore.events.filter( (event) => {
        return event.topic === 'todo.add';
    }).pop();

    let todos = [];

    let toggleAllEvent;

    if(!markAllComplete === true) {
        todos = lastAddEvent.data.todos.map( (todo) => {
            return {
                id: todo.id,
                content: todo.content,
                completed: true
            };
        });

        toggleAllEvent = {
            channel: "sync",
            topic: 'todo.toggle.all.complete',
            eventType: 'click',
            data: {
                todos: todos,
                markAllComplete: true,
                itemsLeft: 0,
                completedItems: todos.length
            }
        }
    } else {
        todos = lastAddEvent.data.todos.map( (todo) => {
            return {
                id: todo.id,
                content: todo.content,
                completed: false
            };
        });

        toggleAllEvent = {
            channel: "sync",
            topic: 'todo.toggle.all.incomplete',
            eventType: 'click',
            data: {
                todos: todos,
                markAllComplete: false,
                itemsLeft: todos.length,
                completedItems: 0
            }
        }
    }

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

            if(event.topic === 'todo.add' || event.topic === 'todo.toggle') {
                return state;
            } else if(event.topic === 'todo.toggle.all.complete' || event.topic === 'todo.toggle.all.incomplete') {
                state.markAllComplete = event.data.markAllComplete;

                return state;
            } else if(event.topic === 'todo.toggle.complete' || event.topic === 'todo.toggle.incomplete') {
                return state;
            }
        }, {
            todos: [],
            markAllComplete: false
        });
    }
}