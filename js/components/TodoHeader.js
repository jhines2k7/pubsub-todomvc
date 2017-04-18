let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/eventlisteners').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function view(component) {
    "use strict";

    return h('header.header', [
        h('h1', 'todos'),
        h('input.new-todo', {props: {placeholder: 'What needs to be done?'}, attrs: {autofocus: true}, on: {keyup: keyUpHandler.bind(null, component)}})
    ]);
}

function updateDom(container, newVnode) {
    "use strict";

    return patch(container, newVnode);
}

function keyUpHandler(component, event) {
    "use strict";

    if(event.keyCode === 13 && event.currentTarget.value !== '') {
        let todoContent = event.currentTarget.value;
        event.currentTarget.value = '';

        // pass the event an array of items
        // get all list items in the dom
        let todos = [];

        let el = document.querySelector('.todo-list');

        if(el) {
            let matches = el.querySelectorAll('li');

            matches.forEach( (li) => {
                todos.push({
                    id: li.id,
                    content: li.innerText,
                    completed: li.querySelector('input').checked
                })
            });
        }

        // add current item
        todos.push({
            id: guid(),
            content: todoContent,
            completed: false
        });

        let addTodoEvent = {
            channel: "sync",
            topic: "todo.add",
            eventType: 'keyup',
            data: todos
        };

        component.publish(addTodoEvent);
    }
}

export default class HeaderComponent {
    constructor(container, eventStore) {
        this.container = container;
        this.eventStore = eventStore;
    }

    publish(event) {
        this.eventStore.add(event);
    }

    render() {
        //return patch(this.container, view(this));
        const newVnode = view(this);
        this.container = updateDom(this.container, newVnode);

        return this.container;
    }
}