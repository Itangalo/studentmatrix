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
  StudentMatrix.loadComponents('studentActions');
  StudentMatrix.loadComponents('iterators');
  StudentMatrix.loadComponents('handlers');
  debug(StudentMatrix.modules.studentActions.studentRows('count'));
}

dev.callback = function(eventInfo) {
  debug('First callback');
}

dev.callback2 = function(eventInfo) {
  debug('Second callback');
}
