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
    var handlers = this.events.get(event);
    log(`Event ${event} arrived. Data:`, data);

    if (!handlers || handlers.length === 0) {
      log(`W Event ${event} has no listeners.`);
      return;
    }

    for (const callback of handlers) {
      try {
        if (data && data.requiresDoneHandler && !data.doneHandler)
          log(`W Data object for ${event} has defined doneHandler property as required.`);

        const result = callback(data);
        
        if (data?.stop === true) break;

        if (result instanceof Promise) {
          result.then(() => {
          }).catch(err => {
            log(`E Error in async handler for "${event}":`, err);
          });
        }
      } catch (err) {
        log(`E Error in event callback for "${event}":`, err);
      }
    }
  }
};

const EventDefinitions = {};
const EventNames = new Proxy({}, {
  get(inst, p) {
    if (p in inst) {
      return inst[p];
    } else {
      const pn = p.toString();
      log(`E Event ${pn} currently is not defined.`);
      return pn;
    }
  }
});

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
    log(`E EventDefinition instances are required here in this operation!`);
    return;
  }

  if (EventDefinitions[eventName])
    log(`W Event "${eventName}" is already defined. Definition is updated now`);

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
  eventData.eventName = eventName;

  if (typeof eventDataInit === 'function')
    eventDataInit(eventData);

  EventBus.snd(eventData);
  return eventData.result;
}

class IEvent {
  //static eventName = 'NewEvent';

  constructor() {
    this.createdAt = new Date();
    this.eventId = newUID();
    this.parentEventId = undefined;
    this.eventName = this.constructor.eventName || this.constructor.name || 'UnnamedEvent';
    this.id = '';
    this.result = undefined;
    this.doneHandler = undefined;
    this.requiresDoneHandler = false;
    this.stop = false;
  }
}
