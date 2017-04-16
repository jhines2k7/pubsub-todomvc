import postal from 'postal/lib/postal.lodash'

export default class EventStore {
    constructor() {
        this.events = [];
    }

    filter(subscriptions) {
        //this._eventStore.filter(isEventForComponent(this._subscriptions));
        return this.events.filter(isEventForComponent(subscriptions));
    }

    add(event) {
        this.events.push(event);
        postal.publish(event);
    }
}

function isEventForComponent(subscriptions) {
    return (event) => {
        return subscriptions.hasOwnProperty(event.topic) && event.topic;
    }
}