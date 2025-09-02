class IPlugin {
  constructor(aliasName, data) {
    this.aliasName = aliasName || '';
    this.config = data;
    this.unsubscribersToEB = [];
    this.eventIdStrict = false;
    this.eventDefinitions = [];
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
    return function(data) {
      const reply = fn(data);
      data.result = reply;
      if (reply && typeof reply.then === "function") {
        reply.then(res => {
          data.result = res;
          data.doneHandler?.(data);
        });
      }
    };
  }
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
