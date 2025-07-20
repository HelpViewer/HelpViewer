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
          if (data && data.requiresDoneHandler && !data.doneHandler)
            console.warn(`! Data object for ${event} has defined doneHandler property as required.`);

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
const EventNames = {};

class EventDefinition {
  constructor(inputType = IEvent, eventName = undefined) {
    this.inputType = inputType;
    this.eventName = eventName;
  }

  createInput() {
    var input = new this.inputType();
    if (this.eventName)
      input.eventName = this.eventName;
    return input;
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
  EventNames[eventName] = eventName;
}

function removeEventDefinition(eventName) {
  delete EventDefinitions[eventName];
}

function sendEventWPromise(eventData) {
  return new Promise((resolve, reject) => {
    eventData.doneHandler = (d) => resolve(d.result);
    try {
      EventBus.snd(eventData);
    } catch (e) {
      reject(e);
    }
  });
}

function sendEventWProm(eventName, eventDataInit) {
  const eventData = getEventInput(eventName);
  if (typeof eventDataInit === 'function')
    eventDataInit(eventData);

  return sendEventWPromise(eventData);
}

function sendEvent(eventName, eventDataInit) {
  const eventData = getEventInput(eventName);
  if (typeof eventDataInit === 'function')
    eventDataInit(eventData);

  EventBus.snd(eventData);
}

class IEvent {
  //static eventName = 'NewEvent';

  constructor() {
    this.createdAt = new Date();
    this.eventName = this.constructor.eventName || this.constructor.name || 'UnnamedEvent';
    this.id = '';
    this.result = undefined;
    this.doneHandler = undefined;
    this.requiresDoneHandler = false;
  }
}
