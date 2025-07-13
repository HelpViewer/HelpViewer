class IPlugin {
  constructor(aliasName, data) {
    this.aliasName = aliasName || '';
  }

  async init() {}
  async deInit() {}
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

    this.pluginClasses.set(name, plugin);
    console.log(`Plugins: registered '${name}'`);
  },

  activate(pluginName, aliasName, data) {
    var plugin = this.pluginsClasses[pluginName];
    var p = new plugin(aliasName, data);

    if (!p) {
      console.error(`Plugin ${plugin} establishment failed!`);
      return;
    }

    p.init();
    this.plugins.set(this.getKey(pluginName, aliasName), p);
  },

  getKey(pluginName, aliasName) {
    return `${pluginName}:${aliasName}`;
  },

  deactivate(pluginName, aliasName) {
    var key = this.getKey(pluginName, aliasName);
    var plugin = this.plugins.get(key);
    if (!plugin)
      return;

    plugin.deInit();
    this.plugins.delete(key);
  }
};

window.PLG = Plugins;

function inheritsFrom(cls, base) {
  while (cls && cls !== Function.prototype) {
    if (cls === base) return true;
    cls = Object.getPrototypeOf(cls);
  }
  return false;
}
