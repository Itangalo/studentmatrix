StudentMatrix.plugins.dev = {
  name : 'Development',
  description : 'Debugging and development tools for StudentMatrix.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-dev.js',
  cell : 'D3',
  dependencies : {
    core : '3.0',
    modules : {
      menu : '1.0',
    },
  },

  globalActions : {
    reset : {
      name : 'Reset all properties and settings',
      group : 'Development',
      processor : function() {
        ScriptProperties.deleteAllProperties();
        debug('All properties deleted.');
      },
    },
    rebuildMenu : {
      name : 'Rebuild the menu',
      group : 'Development',
      processor : function() {
        onOpen();
      },
    },
    dev : {
      name : 'Run temporary dev function',
      group : 'Development',
      processor : function() {
        dev();
      },
    },
  },
};

function debug(variable, option) {
  if (option == 'index') {
    var indexes = '';
    for (var i in variable) {
      indexes = indexes + i + ':' + variable[i] + ' ';
    }
    option = 'pause';
    variable = indexes;
  }
  if (option == 'pause') {
    Browser.msgBox(variable);
    return;
  }
  SpreadsheetApp.getActiveSpreadsheet().toast(variable, typeof variable);
}

function dev() {  
  StudentMatrix.modules.menu.setMenuEntry('plugins.dev.globalActions.rebuildMenu.processor', 'Rebuild menu', 5);
  StudentMatrix.modules.menu.setMenuEntry('plugins.dev.globalActions.dev.processor', 'Dev', 10);
  onOpen();
}
