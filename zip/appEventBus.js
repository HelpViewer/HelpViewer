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

  snd(event, data) {
    if (this.events.has(event)) {
      for (const callback of this.events.get(event))
        callback(data);
    }
  }
};

window.EB = EventBus;

class IEvent {
  //static eventName = 'NewEvent';

  constructor() {
    this.createdAt = new Date();
    this.eventName = this.constructor.eventName || this.constructor.name || 'UnnamedEvent';
    this.id = '';
  }
}
