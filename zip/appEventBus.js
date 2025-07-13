const EventBus = {
  events: new Map(),

  sub(event, callback) {
    if (!this.events.has(event))
      this.events.set(event, new Set());
    this.events.get(event).add(callback);
    return () => this.uns(event, callback);
  },

  uns(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
      if (this.events.get(event).size === 0)
        this.events.delete(event);
    }
  },

  snd(data, eventKeyName) {
    var event = eventKeyName || data.eventName;
    
    if (this.events.has(event)) {
      for (const callback of this.events.get(event)) {
        try {
          const result = callback(data);

          if (result instanceof Promise) {
            result.then(() => {
            }).catch(err => {
              console.error(`! Error in async handler for "${event}":`, err);
            });
          }
        } catch (err) {
          console.error(`! Error in event callback for "${event}":`, err);
        }
      }
    }
  }
};

window.EB = EventBus;

const EventDefinitions = {};

class EventDefinition {
  constructor(inputType = IEvent) {
    this.inputType = inputType;
  }

  createInput() {
    return new this.inputType();
  }
}

function getEventInput(event) {
  return EventDefinitions[event]?.createInput() || new IEvent();
}

function addEventDefinition(eventName, eventDefinition) {
  if (!(eventDefinition instanceof EventDefinition)) {
    console.error(`EventDefinition instances are required here in this operation!`);
    return;
  }

  if (EventDefinitions[eventName])
    console.warn(`Event "${eventName}" is already defined. Definition is updated now`);

  EventDefinitions[eventName] = eventDefinition;
}

function removeEventDefinition(eventName) {
  delete EventDefinitions[eventName];
}

class IEvent {
  //static eventName = 'NewEvent';

  constructor() {
    this.createdAt = new Date();
    this.eventName = this.constructor.eventName || this.constructor.name || 'UnnamedEvent';
    this.id = '';
    this.result = undefined;
    this.doneHandler = undefined;
  }
}
