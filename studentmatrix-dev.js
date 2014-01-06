StudentMatrix.plugins.dev = {
  name : 'Development',
  description : 'Debugging and development tools for StudentMatrix.',
  version : '1.1',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-dev.js',
  cell : 'D3',
  dependencies : {
    core : '3.0',
    modules : {
      menu : '1.0',
    },
  },

  globalActions : {
    devMenu : {
      name : 'Add development menu',
      group : 'Development',
      processor : function() {
        addDevMenu();
      },
    },
    reset : {
      name : 'Reset all properties and settings',
      group : 'Development',
      processor : function() {
        StudentMatrixMenu_resetProperties();
      },
    },
    rebuildMenu : {
      name : 'Rebuild the menu',
      group : 'Development',
      processor : function() {
        StudentMatrixMenu_buildMenu();
      },
    },
    resetMenu : {
      name : 'Reset the menu',
      group : 'Development',
      processor : function() {
        StudentMatrixMenu_resetMenu();
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
  var entry = {
    name : 'Rebuild menu',
    weight : 52,
  };
  StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'buildMenu');
  var entry = {
    name : 'Reset menu',
    weight : 55,
  };
  StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'resetMenu');
  var entry = {
    name : 'Reset all properties',
    weight : 57,
  };
  StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'resetProperties');
  StudentMatrix.modules.menu.buildMenuEntries();
}

function StudentMatrixMenu_buildMenu() {
  StudentMatrix.modules.menu.buildMenuEntries();
}

function StudentMatrixMenu_resetMenu() {
  StudentMatrix.modules.menu.resetMenu();
}

function StudentMatrixMenu_resetProperties() {
  ScriptProperties.deleteAllProperties();
  StudentMatrix.modules.menu.buildMenuEntries();
  debug('All properties deleted.');
}

function dev() {
}
