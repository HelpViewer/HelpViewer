class IPlugin {
  static eventDefinitions = [];

  constructor(aliasName, data) {
    this.aliasName = aliasName || '';
    this.data = data;
    this.unsubscribersToEB = [];
  }

  init() {
    this.constructor.eventDefinitions.forEach(([name, cls, fn]) => {
      this.createEvent(name, fn, cls);
    });
  }

  deInit() {
    const defs = this.constructor.eventDefinitions;
    
    if (Array.isArray(defs)) {
      for (const [eventName] of defs) {
        removeEventDefinition(eventName);
      }
    }

    for (const one of this.unsubscribersToEB)
      one();

    this.unsubscribersToEB = [];
  }

  createEvent(name, handler, dataClass = IEvent) {
    if (handler != null) {
      var handlerFilterId = (d) => {
        if (this.aliasName == '' || d.id == this.aliasName)
          handler(d);
        else
          console.warn(`! [Plugins] Event "${name}" with id "${d.id}" was not forwarded to plugin with id: "${this.aliasName}".`);
      };

      var unsubscribe = EventBus.sub(name, handlerFilterId);
      this.unsubscribersToEB.push(unsubscribe);  
    }
    
    addEventDefinition(name, new EventDefinition(dataClass, name));
  }

  wrapAsyncHandler(fn) {
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

const Plugins = {
  plugins: new Map(),
  pluginsClasses: new Map(),

  catalogize(plugin) {
    if (typeof plugin !== 'function') {
      console.error('Plugins: object is not a class/constructor: ', plugin);
      return;
    }

    const name = plugin.name;
    if (!name) {
      console.error('Plugins: class is anonymous!');
      return;
    }

    if (!inheritsFrom(plugin, IPlugin)) {
      console.error(`Plugins: ${name} class not inherits from IPlugin!`);
      return;
    }

    this.pluginsClasses.set(name, plugin);
    console.log(`Plugins: registered '${name}'`);
  },

  activate(pluginName, aliasName, data) {
    var plugin = this.pluginsClasses.get(pluginName);
    var p = null;

    try {
      p = new plugin(aliasName, data);
    } catch (error) {
      p = null;
      plugin = pluginName;
    }

    if (!p) {
      console.error(`Plugin ${plugin} establishment failed!`);
      return;
    }

    p.init();
    var key = this.getKey(pluginName, aliasName);
    this.plugins.set(key, p);
    console.log(`Plugins: activated '${key}'`);
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
