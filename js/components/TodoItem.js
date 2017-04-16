let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function view(todoItemText) {
    "use strict";

    return h('li', [
        h('div.view', [
            h('input.toggle', {attrs: {type: 'checkbox'}}),
            h('label', todoItemText),
            h('button.destroy')
        ])
    ]);
}

export default class TodoItemComponent {
    constructor(todoItemText) {
        this.todoItemText = todoItemText;
    }

    render() {
        return patch(view(), view(this.todoItemText));
    }
}