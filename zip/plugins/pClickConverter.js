
class ClickedEvent extends IEvent {
  constructor() {
    super();
    this.elementId = null;
    this.elementIdRoot = null;
    this.elementIdVal = null;
    this.target = null;
    this.event = null;
    this.forwarded = false;
  }
}

ClickedEvent.register();

class pClickConverter extends pConvertSysEventToEvent {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_SYSEVENTNAME = 'click';
    this.DEFAULT_KEY_CFG_SYSOBJECT = 'body';
    this.DEFAULT_KEY_CFG_EVENTBUSEVENT = 'ClickedEvent';
  }

  _fillEventObject(d, evt) {
    d.event = evt;
    d.target = d.event?.target;
    d.elementId = d.target?.id
    const splits = d.elementId?.replace('-', '|').split('|').filter(Boolean) ?? [];
    d.elementIdRoot = splits[0];
    d.elementIdVal = splits[1];
  }

}

Plugins.catalogize(pClickConverter);
