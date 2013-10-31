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
//  StudentMatrix.setColumn('process', 3);
//  debug(StudentMatrix.getColumn('process'));
//  debug(StudentMatrix.getColumn('studentName'));
//  debug(StudentMatrix.getColumn('studentName'));

//  StudentMatrix.setColumn('studentName', 3);
  debug(StudentMatrix.getColumn('process'));
//  debug(StudentMatrix.getProperty('StudentMatrixColumns'), 'index');
//  debug(StudentMatrix.columns, 'index');
//  debug(StudentMatrix.getProperty('tmp', StudentMatrix.columns));
}
