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

    //e.which = e.which || e.keyCode;
    if(event.keyCode == 13) {
        console.log(event.currentTarget.value);

        event.currentTarget.value = '';
    }
}

export default class HeaderComponent {
    constructor(container) {
        this.container = container;
    }

    render() {
        return patch(this.container, view(this));
    }
}