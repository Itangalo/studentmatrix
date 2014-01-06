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
        StudentMatrix.modules.menu.buildMenuEntries();
        debug('All properties deleted.');
      },
    },
    rebuildMenu : {
      name : 'Rebuild the menu',
      group : 'Development',
      processor : function() {
        StudentMatrix.modules.menu.buildMenuEntries();
      },
    },
    resetMenu : {
      name : 'Reset the menu',
      group : 'Development',
      processor : function() {
        StudentMatrix.modules.menu.resetMenu();
      },
    },
    devMenu : {
      name : 'Add development menu items',
      group : 'Development',
      processor : function() {
        StudentMatrix.modules.menu.resetMenu();
      },
    },
    dev : {
      name : 'Run temporary dev function',
      group : 'Development',
      processor : function() {
        addDevMenu();
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

function addDevMenu() {
  var entry = {
    weight : 50,
  };
  StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'dev_bar');
  var entry = {
    callback : 'dev',
    name : 'Dev',
    weight : 51,
  };
  StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'dev');
  StudentMatrix.modules.menu.buildMenuEntries();
}

function dev() {
}
