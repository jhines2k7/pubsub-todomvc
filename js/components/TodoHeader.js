let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/eventlisteners').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function view(component) {
    "use strict";

    return h('header.header', [
        h('h1', 'todos'),
        h('input.new-todo', {props: {placeholder: 'What needs to be done?'}, attrs: {autofocus: true}, on: {keyup: keyUpHandler.bind(null, component)}})
    ]);
}

function keyUpHandler(component, event) {
    "use strict";

    if(event.keyCode === 13 && event.currentTarget.value !== '') {
        let todoContent = event.currentTarget.value;
        event.currentTarget.value = '';

        let addTodoEvent = {
            channel: "sync",
            topic: "todo.add",
            eventType: 'keyup',
            data: {
                content: todoContent
            }
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
        return patch(this.container, view(this));
    }
}