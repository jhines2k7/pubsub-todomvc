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
        h('li', {attrs: {id: todo.id}, class: {completed: state.completed}}, [
            h('div.view', [
                h('input.toggle', {attrs: {type: 'checkbox', checked: todo.completed}, on: {click: toggleTodoClickHandler.bind(todo.id, todo.completed)}}),
                h('label', todo.content),
                h('button.destroy')
            ])
        ]);
    });

    return h('section.main', [
        h('input.toggle-all', {attrs: {type: 'checkbox'}}),
        h('label', {attrs: {for: 'toggle-all'}, on: {click: clickHandler.bind(null, component, state.markAllComplete)}}, 'Mark all as complete'),
        h('ul.todo-list', todoItems)
    ]);
}

function toggleTodoClickHandler(id, completed) {
    "use strict";
    console.log('Someone clicked a todo item!');
    let todoToggleCompletedEvent = {
        channel: "sync",
        topic: `todo.toggle`,
        eventType: 'click',
        data: {
            id: id,
            content: document.getElementById(id).innerText.trim(),
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

function clickHandler(component, markAllComplete) {
    "use strict";

    let lastAddEvent = component.eventStore.events.filter( (event) => {
        return event.topic === 'todo.add';
    }).pop();

    let todos = [];

    lastAddEvent.data.todos.forEach( (event) => {
        todos.push({
            id: event.id,
            content: event.content,
            completed: !markAllComplete
        });
    });

    let toggleAllEvent = {
        channel: "sync",
        topic: 'todo.toggle.all',
        eventType: 'click',
        data: {
            todos: todos,
            markAllComplete: !markAllComplete,
            numTodos: lastAddEvent.data.todos.length
        }
    };

    component.publish(toggleAllEvent);
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
            state.todoItems = event.data.todos;

            if(event.topic === 'todo.add') {
                return state;
            } else if(event.topic === 'todo.toggle.all') {
                state.markAllComplete = event.data.markAllComplete;

                return state;
            }
        }, {
            todoItems: [],
            markAllComplete: false
        });
    }
}