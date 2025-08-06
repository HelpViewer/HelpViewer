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
      this.eventIdStrict = true;
    }
  
    static KEY_CFG_TARGET = 'TARGET';
    static KEY_CFG_TREE_ID = 'TREEID';
    static KEY_CFG_PARAM_ID_NAME = 'IDNAMEGETPAR';
  
    static EVT_NAV_MOVE = NavigationMove.name;

    init() {
      const T = this.constructor;
      const TI = this;
      TI.eventDefinitions.push([T.EVT_NAV_MOVE, NavigationMove, null]); // outside event handlers

      const baseId = this.aliasName;
      const target = this.config[T.KEY_CFG_TARGET] || 'header';
      this.treeId = this.config[T.KEY_CFG_TREE_ID] || 'tree';
      const treeId = this.treeId;
      const parIdName = this.config[T.KEY_CFG_PARAM_ID_NAME] || 'id';

      const idLeft = `${baseId}-left`;
      const idTop = `${baseId}-top`;
      const idRight = `${baseId}-right`;

      this.getId = () => getGets(parIdName, (x) => parseInt(x) || 1);

      this.updateNavButtons = (i) => {
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
        const current = this.getId();
        evt.event.preventDefault();
        //setToHrefByValues((d) => d.kvlist.set(parIdName, next));
        this.updateNavButtons(next);
        
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
        const next = this.getId()-1;
        _buttonAction(evt, next, -1);
      }
      TI.buttonLeft = uiAddButton(idLeft, '⬅', target, _buttonActionLeft);
  
      const _buttonActionTop = (evt) => {
        const current = this.getId();
        const treeItem = document.getElementById(treeId + '|' + current);
        var next = 1;
        
        try {
          next = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(treeId.length + 1));
        } catch (error) {
        }

        if (current == next)
          next = 1;

        _buttonAction(evt, next, 0);
      }
      TI.buttonTop = uiAddButton(idTop, '⬆', target, _buttonActionTop);

      const _buttonActionRight = (evt) => {
        const next = this.getId()+1;
        _buttonAction(evt, next, 1);
      }
      TI.buttonRight = uiAddButton(idRight, '➡', target, _buttonActionRight);

      super.init();

      this.updateNavButtons(this.getId());
    }
  
    deInit() {
      const T = this;
      T.buttonLeft?.remove();
      T.buttonTop?.remove();
      T.buttonRight?.remove();
  
      super.deInit();
    }

    onET_GetsChanges(x) {
      this.updateNavButtons(this.getId());
    }

    onET_TreeDataChanged(x) {
      if (x.targetTree == this.treeId)
        this.updateNavButtons(this.getId());
    }
  }
  
  Plugins.catalogize(puiNavigation);
  