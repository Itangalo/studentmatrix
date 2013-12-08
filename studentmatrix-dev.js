StudentMatrix.modules.dev = {
  menuEntries : {
    onOpen : 'Rebuild menu',
    reset : 'reset',
    dev : 'dev',
    test : 'try',
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

function reset() {
  ScriptProperties.deleteAllProperties();
  debug('All properties deleted.');
}

function dev() {
  StudentMatrix.setUpColumns();
//  debug(StudentMatrix.getProperty('color'));
//  debug(StudentMatrix.modules.studentActions.studentRows('count'));
}
