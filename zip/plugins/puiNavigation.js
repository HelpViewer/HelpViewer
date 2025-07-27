class puiNavigation extends IPlugin {
    constructor(aliasName, data) {
      super(aliasName, data);
    }
  
    static eventDefinitions = [];
  
    static KEY_CFG_TARGET = 'TARGET';
    static KEY_CFG_TREE_ID = 'TREEID';
    static KEY_CFG_PARAM_ID_NAME = 'IDNAMEGETPAR';
  
    static buttonLeft;
    static buttonTop;
    static buttonRight;
  
    init() {
      const baseId = this.aliasName;
      const target = this.config[puiNavigation.KEY_CFG_TARGET] || 'header';
      const treeId = this.config[puiNavigation.KEY_CFG_TREE_ID] || 'tree';
      const parIdName = this.config[puiNavigation.KEY_CFG_PARAM_ID_NAME] || 'id';

      const idLeft = `${baseId}-left`;
      const idTop = `${baseId}-top`;
      const idRight = `${baseId}-right`;

      const getId = () => getGets(parIdName, (x) => parseInt(x) || 1);

      const updateNavButtons = (i) => {
        i = parseInt(i);
        alert('updateNavButtons : ' + i);
        var indexPrev = i - 1;
        var indexNext = i + 1;
        const prevTreeItem = document.getElementById(treeId + '|' + indexPrev);
        const nextTreeItem = document.getElementById(treeId + '|' + indexNext);

        alert('updateNavButtons : ' + prevTreeItem + ' ' + nextTreeItem + '(' + indexPrev + ' ' + nextTreeItem + ' )');
        toggleVisibility(puiNavigation.buttonLeft, !!prevTreeItem);
        toggleVisibility(puiNavigation.buttonRight, !!nextTreeItem);
        toggleVisibility(puiNavigation.buttonTop, !(i <= 1));
      }

      const _buttonAction = (evt, next) => {
        evt.event.preventDefault();
        setToHrefByValues((d) => d.kvlist.set(parIdName, next));
        updateNavButtons(next);
      }

      const _buttonActionLeft = (evt) => {
        const next = getId()-1;
        _buttonAction(evt, next);
      }
      puiNavigation.buttonLeft = uiAddButton(idLeft, '⬅', target, _buttonActionLeft);
  
      const _buttonActionTop = (evt) => {
        const current = getId();
        const treeItem = document.getElementById(treeId + '|' + current);
        var next = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(treeId.length + 1));
        if (current == next)
          next = 1;
        _buttonAction(evt, next);
      }
      puiNavigation.buttonTop = uiAddButton(idTop, '⬆', target, _buttonActionTop);

      const _buttonActionRight = (evt) => {
        const next = getId()+1;
        _buttonAction(evt, next);
      }
      puiNavigation.buttonRight = uiAddButton(idRight, '➡', target, _buttonActionRight);

      super.init();
      this.eventIdStrict = true;

      updateNavButtons(getId());
    }
  
    deInit() {
      puiNavigation.buttonLeft?.remove();
      puiNavigation.buttonTop?.remove();
      puiNavigation.buttonRight?.remove();
  
      super.deInit();
    }
  }
  
  Plugins.catalogize(puiNavigation);
  