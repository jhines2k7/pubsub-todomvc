let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function view() {
    "use strict";

    return h('header.header', [
        h('h1', 'todos'),
        h('input.new-todo', {props: {placeholder: 'What needs to be done?'}})
    ]);
}

export default class HeaderComponent {
    constructor(container) {
        this.container = container;
    }

    render() {
        return patch(this.container, view());
    }
}