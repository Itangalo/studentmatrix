StudentMatrix.modules.dev = {
//  menuEntries : {
//    dev : 'dev',
//  },
};

StudentMatrix.plugins.dev = {
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
  debug(SpreadsheetApp.getActiveRange().getCell(1, 1).getValue());
//  var colors = StudentMatrix.getProperty('assessmentColors').split('\n');
//  debug(colors.indexOf('#bf9000'));
  
//  StudentMatrix.loadComponents('fetchers');
//  var ss = StudentMatrix.components.fetchers.studentSpreadsheet(2);
//  debug(ss.getName());

//  var selection = SpreadsheetApp.getActiveRange().getA1Notation();
//  StudentMatrix.components.fetchers.studentRange(2, 'Betygsunderlag', selection).setBackground('green');
//  debug(ss.getRange(selection).getValue());
  
  
//  var template = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
//  var tabID = 4;
//  var sheetID = SpreadsheetApp.getActiveSheet().getSheetId();
//  StudentMatrix.setProperty(15, 'StudentMatrixPushMapping', 1.toString());
  
//  debug(StudentMatrix.getProperty('StudentMatrixPushMapping'));
}
