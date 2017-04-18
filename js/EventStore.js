import postal from 'postal/lib/postal.lodash'

export default class EventStore {
    constructor() {
        this.events = [];
    }

    filter(subscriptions) {
        return this.events.filter(isEventForComponent(subscriptions));
    }

    add(events) {
        if(Array.isArray(events)) {
            this.events = events.reduce( function(collection, event){
                collection.push( event );

                return collection;
            }, this.events );

            events.forEach( (event) => {
                postal.publish(event);
            });
        } else {
            this.events.push(events);
            postal.publish(events);
        }
    }
}

function isEventForComponent(subscriptions) {
    return (event) => {
        return subscriptions.hasOwnProperty(event.topic) && event.topic;
    }
}