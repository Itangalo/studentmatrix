function onOpen() {
  var entries = [];
  entries.push({name : 'Run actions on students', functionName : 'actionsDialog'});
  entries.push({name : 'Settings', functionName : 'StudentMatrixSettingsDialog'});
  entries.push({name : 'Setup columns', functionName : 'setupColumns'});
  entries.push(null);
  entries.push({name : 'Rebuild menu', functionName : 'onOpen'});
  entries.push({name : 'reset', functionName : 'reset'});
  entries.push({name : 'dev', functionName : 'dev'});
  entries.push({name : 'try', functionName : "dev"});

  SpreadsheetApp.getActiveSpreadsheet().addMenu('StudentMatrix', entries);
}

/**
 * Sets up column headers for all columns declared in StudentMatrix.columns.
 */
function setupColumns() {
  for (columnID in StudentMatrix.columns) {
    if (parseInt(StudentMatrix.getProperty('StudentMatrixColumns', columnID)) > 0) {
      StudentMatrix.mainSheet().getRange(1, StudentMatrix.getProperty('StudentMatrixColumns', columnID)).setValue(StudentMatrix.columns[columnID]);
    }
    else {
      var column = StudentMatrix.mainSheet().getLastColumn() + 1;
      StudentMatrix.mainSheet().getRange(1, column).setValue(StudentMatrix.columns[columnID]);
      StudentMatrix.setProperty(column, 'StudentMatrixColumns', columnID);
    }
  }
  StudentMatrix.mainSheet().setFrozenRows(StudentMatrix.firstStudentRow() - 1);
}

/**
 * A number of basic properties for StudentMatrix.
 */
var StudentMatrix = (function() {
  mainSheet = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  };
  firstStudentRow = function() {
    return 2;
  };
  lastStudentRow = function() {
    return StudentMatrix.mainSheet().getLastRow();
  };
  numberOfStudents = function() {
    return StudentMatrix.lastStudentRow() - StudentMatrix.firstStudentRow() + 1;
  };
  
  // Reveal the public methods.
  return {
    mainSheet : mainSheet,
    firstStudentRow : firstStudentRow,
    lastStudentRow : lastStudentRow,
    numberOfStudents : numberOfStudents,
  }
})();

/**
 * Column declarations included in StudentMatrix core.
 */
StudentMatrix.columns = {
  process : 'Process',
  studentName : 'Student name',
  studentMail : 'Student email',
}

StudentMatrix.components = {};

StudentMatrix.components.settings = {
  name : 'string',
  group : 'string',
  description : 'string',
  iterator : 'string',
  processor : 'function',
}

/**
 * Loads a JSON parsed property.
 *
 * If subPropertyName is set, the property will be fetched from the object stored
 * on propertyName.
 */
StudentMatrix.getProperty = function(propertyName, subPropertyName) {
  var value = JSON.parse(ScriptProperties.getProperty(propertyName));
  if (typeof subPropertyName == 'string') {
    if (value == null) {
      return undefined;
    }
    else {
      return value[subPropertyName];
    }
  }
  return value;
}

/**
 * Stores a variable as a JSON parsed script property.
 *
 * If subPropertyName is set, propertyName will be treated as an object, whose property
 * 'subPropertyName' will be set to value. That is, you will get
 * properties[propertyName][subPropertyName] = value.
 */
StudentMatrix.setProperty = function(value, propertyName, subPropertyName) {
  if (typeof subPropertyName == 'string') {
    var object = StudentMatrix.getProperty(propertyName);
    if (object == null || typeof object != 'object') {
      object = {};
    }
    object[subPropertyName] = value;
    StudentMatrix.setProperty(object, propertyName);
  }
  else {
    ScriptProperties.setProperty(propertyName, JSON.stringify(value));
  }
}

/**
 * Returns an object with all component groups, each group containing its components.
 */
StudentMatrix.getComponentsByGroup = function(type) {
  var components = {};
  for (var component in StudentMatrix[type]) {
    var group = StudentMatrix[type][component].group;
    if (typeof group == 'undefined') {
      group = 'Other';
    }
    if (typeof components[group] == 'undefined') {
      components[group] = {};
    }
    components[group][component] = StudentMatrix[type][component].name;
  }
  return components;
}

function StudentMatrixSettingsDialog() {
  var app = UiApp.createApplication();
  var handler = app.createServerHandler('StudentMatrixSettingsHandler');

  var settingsComponents = StudentMatrix.getComponentsByGroup('settings');
  var settingsList = app.createListBox().setId('selectedSetting').setName('selectedSetting').addChangeHandler(handler);
  
  for (var group in settingsComponents) {
    settingsList.addItem('-- ' + group + ' --', null);
    app.add(app.createHTML('Select setting'));
    for (var setting in settingsComponents[group]) {
      settingsList.addItem(StudentMatrix.settings[setting].name, setting);
    }
  }
  app.add(settingsList);
  app.add(app.createVerticalPanel().setId('settingsPanel'));
  
  var okButton = app.createButton('Save', handler)
  app.add(okButton);
  
  SpreadsheetApp.getActiveSpreadsheet().show(app);
}

function StudentMatrixSettingsHandler(eventInfo) {
  if (eventInfo.parameter.source == 'selectedSetting') {
    var app = UiApp.getActiveApplication();
    var panel = app.getElementById('settingsPanel');
    panel.clear();
    var setting = eventInfo.parameter.selectedSetting;
    if (setting == 'null') {
      return app;
    }
//    var handler = UiApp.getActiveApplication().getElementById('StudentMatrixSettingsHandler');
    StudentMatrix.settings[setting].formBuilder(panel);

//    debug(eventInfo.parameter, 'index');
    return UiApp.getActiveApplication();
  }
  
  for (var setting in StudentMatrix.settings) {
    StudentMatrix.settings[setting].processor(eventInfo);
  }
}

// Declares some empty properties, so it can be populated by components.
//for (var component in StudentMatrix.components) {
//  StudentMatrix[component] = {};
//}
StudentMatrix.options = {};
StudentMatrix.settings = {};
StudentMatrix.studentActions = {};
StudentMatrix.iterators = {};
