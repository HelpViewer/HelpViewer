class IPlugin {
  constructor(aliasName, data) {
    this.aliasName = aliasName || '';
    this.config = data;
    this.unsubscribersToEB = [];
    this.eventIdStrict = false;
    this.eventDefinitions = [];
    this.eventCallsMap = new Map();
  }

  init() {
    const prefixEventHandler = /^onET/;
    var _handleFunctionToSubscription = (instance, name) => {
      browseMember(instance, name, (desc) => {
        if (typeof desc.value !== 'function') return;
        var nameBase = name.replace(prefixEventHandler, '');
  
        if (nameBase.startsWith('_')) {
          nameBase = nameBase.slice(1);
          this._subscribeHandler(nameBase, this.aliasName, desc.value.bind(this));
        } else {
          this._prepareFilteredHandler(nameBase, desc.value.bind(this));
        }
      });
    };

    var proto = Object.getPrototypeOf(this);
    Object.getOwnPropertyNames(proto).filter(name => prefixEventHandler.test(name)).forEach(name => _handleFunctionToSubscription(proto, name));

    this.eventDefinitions.forEach(([name, cls, fn]) => {
      this.createEvent(name, fn, cls);
    });
  }

  deInit() {
    // const defs = this.eventDefinitions;
    
    // if (Array.isArray(defs)) {
    //   for (const [eventName] of defs) {
    //     removeEventDefinition(eventName);
    //   }
    // }

    for (const one of this.unsubscribersToEB)
      one();

    this.unsubscribersToEB = [];

    const siblingDeInitParents = getSubmodulesInModule(this);
    const siblingDeInit = siblingDeInitParents.map(x => x.deInit.bind(x)).filter(x => x);

    log(`Plugin deInit ${this.constructor.name} found ${siblingDeInit.length} (${siblingDeInitParents.map(x => `${x.constructor.name}:${x.aliasName}` || x.constructor.name).join(', ')}) ... calling deInit also for them.`);
    siblingDeInit.forEach(x => x());
    log(`Plugin deInit ${this.constructor.name} siblings finished.`);
  }

  createEvent(name, handler, dataClass = IEvent) {
    this._prepareFilteredHandler(name, handler);
    addEventDefinition(name, new EventDefinition(dataClass, name));
  }

  _prepareFilteredHandler(name, handler) {
    if (handler != null) {
      const alias = this.aliasName;
      const strictSwitch = this.eventIdStrict;
      var handlerFilterId = (d) => {
        if (isEventHandlerOpened(alias, strictSwitch, d.id))
        {
          log(`[Plugins] Event "${name}" with id "${d.id}" forwarded to plugin ${this.constructor.name} with id: "${alias}".`);
          handler(d);
        }
        else
          log(`W [Plugins] Event "${name}" with id "${d.id}" was not forwarded to plugin ${this.constructor.name} with id: "${alias}".`);
      };

      this._subscribeHandler(name, alias, handlerFilterId);
      handlerFilterId.__pluginPath = `${this.constructor.name}:${alias}:${handler.name};${handlerFilterId.name}`;
    }
  }

  _subscribeHandler(name, alias, handler) {
    var unsubscribe = EventBus.sub(name, handler);
    handler.__pluginPath = `${this.constructor.name}:${alias}:${handler.name}`;
    log(`[Plugins] Subscription for event "${name}" in plugin "${this.constructor.name}" with id: "${alias}" created.`);
    this.unsubscribersToEB.push(unsubscribe);  
  }

  static wrapAsyncHandler(fn) {
    var reply = function(data) {
      const reply = fn(data);
      data.result = reply;
      if (reply && typeof reply.then === "function") {
        reply.then(res => {
          data.result = res;
          data.doneHandler?.(data);
        });
      }
    };
    reply.__name = fn.name;
    return reply;
  }

  catalogizeEventCall(fn, eventName, eventId = '') {
    const key = eventName;
    if (!this.eventCallsMap.has(key))
      this.eventCallsMap.set(key, new Set());
    const val = `${fn.__name || fn.name || fn}:${eventId}`;
    this.eventCallsMap.get(key).add(val);
  }
}

function getSubmodulesInModule(pluginInstance) {
  return Object.values(pluginInstance).filter((x) => typeof x?.['deInit'] === "function");
}

function isEventHandlerOpened(alias, strictSwitch, eventId) {
  return eventId == alias || (!strictSwitch && (!eventId || alias == ''));
}

class Resource extends IPlugin {
  constructor(aliasName, data, source = STO_DATA, fileList = '') {
    super(aliasName, data);
    this.fileList = fileList.split(';');
    this.source = source;
    this._fileLength = 0;
    this.licenseFile = this.fileList.filter(x => /licen[cs]e/i.test(x));
    this.readmeFile = this.fileList.filter(x => /readme/i.test(x));

    Promise.all(
      this.fileList.map(async f => {
        const content = await _Storage.search(source, f);
        return new TextEncoder().encode(content).length;
      })
    ).then(lengths => this._fileLength = lengths.reduce((sum, len) => sum + len, 0));
  }

  init(resultI) {
    const promises = this.fileList
    .filter(one => !$(one))
    .map(one => 
      storageSearch(this.source, one).then(x => {
        if (one.endsWith('.js')) appendJavaScript(one, x, document.head);
        if (one.endsWith('.css')) appendCSS(one, x);
      })
    );
  
    return Promise.all(promises);
  }

  deInit() {
    this.fileList.forEach(one => $(one)?.remove());
  }
}

function browseMember(instance, name, handler) {
  const desc = Object.getOwnPropertyDescriptor(instance, name);
  if (!desc) return;
  handler(desc);
};

const Plugins = {
  plugins: new Map(),
  pluginsClasses: new Map(),

  catalogize(plugin) {
    if (typeof plugin !== 'function') {
      log('E Plugins: object is not a class/constructor: ', plugin);
      return;
    }

    const name = plugin.name;
    if (!name) {
      log('E Plugins: class is anonymous!');
      return;
    }

    if (!inheritsFrom(plugin, IPlugin)) {
      log(`E Plugins: ${name} class not inherits from IPlugin!`);
      return;
    }

    this.pluginsClasses.set(name, plugin);
    log(`Plugins: registered '${name}'`);
  },

  activate(pluginName, aliasName, data) {
    var plugin = this.pluginsClasses.get(pluginName);
    var p = null;

    try {
      p = new plugin(aliasName, data);
    } catch (error) {
      p = null;
      plugin = pluginName;
      log(`E Plugin ${plugin} error!`, error);
    }

    if (!p) {
      log(`E Plugin ${plugin} establishment failed!`);
      return;
    }

    p.init();
    var key = this.getKey(pluginName, aliasName);
    this.plugins.set(key, p);
    log(`Plugins: activated '${key}'`);
  },

  getKey(pluginName, aliasName) {
    return `${pluginName}:${aliasName}`;
  },

  deactivate(pluginName, aliasName = '') {
    var key = this.getKey(pluginName, aliasName);
    var plugin = this.plugins.get(key);
    if (!plugin)
      return;

    plugin.deInit();
    this.plugins.delete(key);
  }
};

function inheritsFrom(cls, base) {
  while (cls && cls !== Function.prototype) {
    if (cls === base) return true;
    cls = Object.getPrototypeOf(cls);
  }
  return false;
}

function getAllParents(cls) {
  const chain = [];

  while (cls && cls !== Object) {
    chain.push(cls.name || undefined);
    cls = Object.getPrototypeOf(cls);
  }

  chain.push("Object");
  return chain;
}

class SystemEventHandler extends IPlugin {
  constructor(aliasName, data, target, eventName, handler) {
    super(aliasName, data);
    this.target = target;
    this.eventName = eventName;
    this.handler = handler;
    this.aliasName = this.aliasName || `${this.getTargetName(target)}.${eventName}`;
  }

  init() {
    this.target.addEventListener(this.eventName, this.handler);
  }

  deInit() {
    this.target.removeEventListener(this.eventName, this.handler);
  }

  getTargetName(target) {
    if (target === window) return "window";
    if (target instanceof Document) return "Document";
    if (target instanceof HTMLElement)
      return this.target.id || this.target.tagName;
    if (target instanceof EventTarget) return "EventTarget";
    return Object.prototype.toString.call(target);
  }

  static getTargetFromName(target) {
    const targetType = target.toLowerCase();
    if (targetType == 'window') return window;
    if (targetType == 'document') return document;
    if (targetType == 'body') return document.body;

    if (target.startsWith('#')) return $(target.substring(1));

    log(`E Target ${target} could not be mapped to any element! ... returns undefined`);

    return undefined;
  }
}

Plugins.catalogize(IPlugin);
Plugins.catalogize(Resource);
Plugins.catalogize(SystemEventHandler);
