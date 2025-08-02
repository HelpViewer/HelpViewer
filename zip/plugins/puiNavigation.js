class NavigationMove extends IEvent {
  constructor() {
    super();
    this.treeId = null;
    this.previousId = 0;
    this.newId = 0;
    this.newIdTreeItem = undefined;
    this.direction = undefined;
    this.paramIdName = undefined;
  }
}
class puiNavigation extends IPlugin {
    constructor(aliasName, data) {
      super(aliasName, data);
      this.buttonLeft = undefined;
      this.buttonTop = undefined;
      this.buttonRight = undefined;
    }
  
    static eventDefinitions = [];
  
    static KEY_CFG_TARGET = 'TARGET';
    static KEY_CFG_TREE_ID = 'TREEID';
    static KEY_CFG_PARAM_ID_NAME = 'IDNAMEGETPAR';
  
    static EVT_NAV_MOVE = NavigationMove.name;

    init() {
      const T = this.constructor;
      const TI = this;
      T.eventDefinitions.push([T.EVT_NAV_MOVE, NavigationMove, null]); // outside event handlers

      const baseId = this.aliasName;
      const target = this.config[T.KEY_CFG_TARGET] || 'header';
      const treeId = this.config[T.KEY_CFG_TREE_ID] || 'tree';
      const parIdName = this.config[T.KEY_CFG_PARAM_ID_NAME] || 'id';

      const idLeft = `${baseId}-left`;
      const idTop = `${baseId}-top`;
      const idRight = `${baseId}-right`;

      const getId = () => getGets(parIdName, (x) => parseInt(x) || 1);

      const updateNavButtons = (i) => {
        i = parseInt(i);
        var indexPrev = i - 1;
        var indexNext = i + 1;
        const prevTreeItem = document.getElementById(treeId + '|' + indexPrev);
        const nextTreeItem = document.getElementById(treeId + '|' + indexNext);

        toggleVisibility(TI.buttonLeft, !!prevTreeItem);
        toggleVisibility(TI.buttonRight, !!nextTreeItem);
        toggleVisibility(TI.buttonTop, !(i <= 1));
      }

      const _buttonAction = (evt, next, direction) => {
        const current = getId();
        evt.event.preventDefault();
        //setToHrefByValues((d) => d.kvlist.set(parIdName, next));
        updateNavButtons(next);
        
        if (next == current)
          return;

        sendEvent(T.EVT_NAV_MOVE, (data) => {
          data.id = this.aliasName;
          data.treeId = treeId;
          data.previousId = current;
          data.newId = next;
          data.newIdTreeItem = treeId + '|' + next;
          data.direction = direction;
          data.paramIdName = parIdName;
        });
      }

      const _buttonActionLeft = (evt) => {
        const next = getId()-1;
        _buttonAction(evt, next, -1);
      }
      TI.buttonLeft = uiAddButton(idLeft, '⬅', target, _buttonActionLeft);
  
      const _buttonActionTop = (evt) => {
        const current = getId();
        const treeItem = document.getElementById(treeId + '|' + current);
        var next = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(treeId.length + 1));
        if (current == next)
          next = 1;
        _buttonAction(evt, next, 0);
      }
      TI.buttonTop = uiAddButton(idTop, '⬆', target, _buttonActionTop);

      const _buttonActionRight = (evt) => {
        const next = getId()+1;
        _buttonAction(evt, next, 1);
      }
      TI.buttonRight = uiAddButton(idRight, '➡', target, _buttonActionRight);

      super.init();
      this.eventIdStrict = true;

      updateNavButtons(getId());

      this.subscribedGets = EventBus.sub(EventNames.GetsChanges, (data) => updateNavButtons(getId()));
      this.subscribedTreeChange = EventBus.sub(EventNames.TreeDataChanged, (data) => updateNavButtons(getId()));
    }
  
    deInit() {
      const T = this;
      T.buttonLeft?.remove();
      T.buttonTop?.remove();
      T.buttonRight?.remove();
      T.subscribedGets?.();
      T.subscribedTreeChange?.();
  
      super.deInit();
    }
  }
  
  Plugins.catalogize(puiNavigation);
  