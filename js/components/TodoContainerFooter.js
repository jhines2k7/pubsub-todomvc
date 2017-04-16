let snabbdom = require('snabbdom');

let patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/attributes').default
]);

let h = require('snabbdom/h').default; // helper function for creating vnodes

function view() {
    "use strict";

    return h('footer.footer', [
        h('span.todo-count', [
            h('strong', '0 items left')
        ]),
        h('ul.filters', [
            h('li', [h('a.selected', {props: {href: '#/'}}, 'All')]),
            h('li', [h('a', {props: {href: '#/active'}}, 'Active')]),
            h('li', [h('a', {props: {href: '#/completed'}}, 'Completed')])
        ]),
        // Hidden if no completed items are left
        h('button.clear-completed', 'Clear completed')
    ]);
}

export default class TodoContainerFooter {
    constructor(container) {
        this.container = container;
    }

    render() {
        return patch(this.container, view());
    }
}