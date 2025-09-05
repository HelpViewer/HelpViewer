class NavigationMove extends IEvent {
  constructor() {
    super();
    this.treeId = '';
    this.previousId = 0;
    this.newId = 0;
    this.newIdTreeItem = '';
    this.direction = 0;
    this.paramIdName = '';
  }
}

class DoNavigationMove extends IEvent {
  constructor() {
    super();
    this.direction = 0;
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
    static EVT_NAV_DOMOVE = DoNavigationMove.name;

    init() {
      const T = this.constructor;
      const TI = this;

      TI.eventDefinitions.push([T.EVT_NAV_MOVE, NavigationMove, null]); // outside event handlers

      this.DEFAULT_KEY_CFG_TARGET = 'header';
      this.DEFAULT_KEY_CFG_TREEID = 'tree';
      this.DEFAULT_KEY_CFG_IDNAMEGETPAR = 'id';
  
      const baseId = this.aliasName;
      const target = this.config[T.KEY_CFG_TARGET] || this.DEFAULT_KEY_CFG_TARGET;
      this.treeId = this.config[T.KEY_CFG_TREE_ID] || this.DEFAULT_KEY_CFG_TREEID;
      const treeId = this.treeId;
      const parIdName = this.config[T.KEY_CFG_PARAM_ID_NAME] || this.DEFAULT_KEY_CFG_IDNAMEGETPAR;

      const idLeft = `${baseId}-left`;
      const idTop = `${baseId}-top`;
      const idRight = `${baseId}-right`;

      this.getId = () => getGets(parIdName, (x) => parseInt(x) || 1);

      this.updateNavButtons = (i) => {
        i = parseInt(i);
        var indexPrev = i - 1;
        var indexNext = i + 1;
        const prevTreeItem = $(treeId + '|' + indexPrev);
        const nextTreeItem = $(treeId + '|' + indexNext);

        toggleVisibility(TI.buttonLeft, !!prevTreeItem);
        toggleVisibility(TI.buttonRight, !!nextTreeItem);
        toggleVisibility(TI.buttonTop, Boolean((i > 1) && (prevTreeItem || nextTreeItem)));
      }

      const _buttonAction = (evt, next, direction) => {
        const current = this.getId();
        evt.event.preventDefault();
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
        const treeItem = $(treeId + '|' + current);
        var next = 1;
        
        try {
          next = parseInt($O('summary > a', treeItem.parentElement.parentElement.parentElement).id.slice(treeId.length + 1));
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

      const h_EVT_NAV_DOMOVE = (evt) => {
        switch (evt.direction) {
          case -1:
            _buttonActionLeft(evt);
            break;
            
          case 0:
            _buttonActionTop(evt);
            break;

          case 1:
            _buttonActionRight(evt);
            break;

          default:
            break;
        }
      };

      TI.eventDefinitions.push([T.EVT_NAV_DOMOVE, DoNavigationMove, h_EVT_NAV_DOMOVE]);

      super.init();

      TI.catalogizeEventCall(TI.init, EventNames.ButtonCreate);
      TI.catalogizeEventCall(TI.init, EventNames.ButtonSend);
      TI.catalogizeEventCall(_buttonAction, T.EVT_NAV_MOVE, this.aliasName);

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
  