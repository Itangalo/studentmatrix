function onOpen() {
  var entries = [];
  entries.push({name : 'dev', functionName : 'dev'});
  entries.push({name : 'reset', functionName : 'reset'});
  entries.push({name : 'Process student sheets', functionName : 'actionsDialog'});
  entries.push({name : 'Setup columns', functionName : 'setupColumns'});

  SpreadsheetApp.getActiveSpreadsheet().addMenu('Development', entries);
}

/**
 * Sets up column headers for all columns declared in StudentMatrix.columns.
 */
function setupColumns() {
  for (columnID in StudentMatrix.columns) {
    if (parseInt(StudentMatrix.getColumn(columnID)) > 0) {
      StudentMatrix.mainSheet().getRange(1, StudentMatrix.getColumn(columnID)).setValue(StudentMatrix.columns[columnID]);
    }
    else {
      var column = StudentMatrix.mainSheet().getLastColumn() + 1;
      StudentMatrix.mainSheet().getRange(1, column).setValue(StudentMatrix.columns[columnID]);
      StudentMatrix.setColumn(columnID, column);
    }
  }
}

/**
 * A number of basic properties for StudentMatrix.
 */
StudentMatrix = {
  mainSheet : function() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  },
  firstStudentRow : function() {
    return 2;
  },
  lastStudentRow : function() {
    return StudentMatrix.mainSheet().getLastRow();
  },
  numberOfStudents : function() {
    return StudentMatrix.lastStudentRow() - StudentMatrix.firstStudentRow() + 1;
  }
}

/**
 * Column declarations included in StudentMatrix core.
 */
StudentMatrix.columns = {
  process : 'Process',
  studentName : 'Student name',
  studentMail : 'Student email',
}

/**
 * Returns an array with row numbers of all students that should be processed.
 */
StudentMatrix.studentRows = function(mode) {
  var studentRows = [];
  if (mode == 'ProcessAll') {
    for (var row = StudentMatrix.firstStudentRow(); row <= StudentMatrix.lastStudentRow(); row++) {
      studentRows[row] = row;
    }
  }
  if (mode == 'ProcessSelected') {
    var column = StudentMatrix.getColumn('process');
    for (var row = StudentMatrix.firstStudentRow(); row <= StudentMatrix.lastStudentRow(); row++) {
      if (StudentMatrix.mainSheet().getRange(row, column).getValue() == 1) {
        studentRows[row] = row;
      }
    }
  }
  return studentRows;
}

/**
 * Loads a JSON parsed property, and uses fallback if the property is not set.
 */
StudentMatrix.getProperty = function(propertyName, fallback) {
  if (typeof fallback == 'undefined') {
    fallback = '';
  }
  try {
    var raw = ScriptProperties.getProperty(propertyName);
    var value = JSON.parse(raw);
  }
  catch(e) {
    var value = fallback;
    StudentMatrix.setProperty(propertyName, fallback);
  }
  return value;
}

/**
 * Stores a variable as a JSON parsed script property.
 */
StudentMatrix.setProperty = function(propertyName, value) {
  ScriptProperties.setProperty(propertyName, JSON.stringify(value));
}

/**
 * Gets the column number for a specified column ID.
 */
StudentMatrix.getColumn = function(columnID) {
  var columns = StudentMatrix.getProperty('StudentMatrixColumns');
  try {
    return columns[columnID];
  }
  catch(e) {
    return false;
  }
}

/**
 * Stores the column number for a specified column ID.
 */
StudentMatrix.setColumn = function(columnID, columnNumber) {
  var columns = StudentMatrix.getProperty('StudentMatrixColumns', {});
  try {
    columns[columnID] = columnNumber;
  }
  catch(e) {
    columns = {};
    columns[columnID] = columnNumber;
  }
  StudentMatrix.setProperty('StudentMatrixColumns', columns);
}

/**
 * Displays a dialog used for selecting actions for processing student sheets.
 */
function actionsDialog() {
  var app = UiApp.createApplication().setTitle('Process student sheets');
  var handler = app.createServerHandler('actionsDialogHandler');

  var actionsList = app.createListBox().setId('SelectedAction').setName('SelectedAction');
  actionsList.addItem('Select an action to run', null);
  for (plugin in StudentMatrix.plugins) {
    actionsList.addItem(StudentMatrix.plugins[plugin].name, plugin);
  }
  actionsList.addChangeHandler(handler);
  app.add(actionsList);
  handler.addCallbackElement(actionsList);

  app.add(app.createLabel('', true).setId('ActionDescription'));

  app.add(app.createButton('Run for all students', handler).setId('ProcessAll'));
  app.add(app.createButton('Run for selected students (NN)', handler).setId('ProcessSelected'));
  app.add(app.createButton('Select students and run', handler).setId('SelectAndProcess'));
  SpreadsheetApp.getActiveSpreadsheet().show(app);
  return app;
}

/**
 * Handler for the actions dialog. Calls actions or updates dialog info.
 */
function actionsDialogHandler(eventInfo) {
  // When changing selected action, update the action description.
  if (eventInfo.parameter.source == 'SelectedAction') {
    var plugin = eventInfo.parameter.SelectedAction;
    var app = UiApp.getActiveApplication();
    var description = app.getElementById('ActionDescription');
    try {
      description.setText(StudentMatrix.plugins[plugin].description);
    }
    catch(e) {
      description.setText('');
    }
    return app;
  }

  // Call the relevant processor
  if (eventInfo.parameter.source == 'ProcessAll') {
    debug('Processing...');
    var plugin = eventInfo.parameter.SelectedAction;
    var iterator = StudentMatrix.plugins[plugin].iterator;
    for (var row in StudentMatrix.studentRows('ProcessAll')) {
      var object = StudentMatrix.iterators[iterator](row);
      StudentMatrix.plugins[plugin].processor(object);
    }
    var app = UiApp.getActiveApplication();
    app.close()
    return app;
  }
  if (eventInfo.parameter.source == 'SelectAndProcess') {
    selectStudents(eventInfo);
  }
}

/**
 * Displays a dialog for selecting students to process.
 */
function selectStudents(eventInfo) {
  debug('Reading students...');
  var app = UiApp.createApplication().setTitle('Select which students to process');
  var panel = app.createVerticalPanel().setHeight('100%');

  var checkboxes = [];
  var handler = app.createServerHandler('studentDialogHandler');
  var processColumn = StudentMatrix.getColumn('process');
  var nameColumn = StudentMatrix.getColumn('studentName');

  for (var row in StudentMatrix.studentRows('ProcessAll')) {
    var values = StudentMatrix.iterators.getRowValues(row);
    checkboxes[row] = app.createCheckBox(values[0][nameColumn - 1]).setValue(values[0][processColumn - 1] == 1).addClickHandler(handler).setId(row).setName(2);
    panel.add(checkboxes[row]);
  }

  panel.add(app.createButton('Run action', handler).setId('RunAction'));
  app.add(app.createScrollPanel(panel).setHeight('100%'));

  var hidden = app.createHidden('SelectedAction', eventInfo.parameter.SelectedAction);
  handler.addCallbackElement(hidden);

  SpreadsheetApp.getActiveSpreadsheet().show(app);
  return app;
}

/**
 * Handler for the student selection dialog. Toggles process flag or runs actions.
 */
function studentDialogHandler(eventInfo) {
  // If the 'Run action' button was hit, call the relevant processor.
  if (eventInfo.parameter.source == 'RunAction') {
    var app = UiApp.getActiveApplication();
    debug('running...');
    var plugin = eventInfo.parameter.SelectedAction;
    var iterator = StudentMatrix.plugins[plugin].iterator;
    for (var row in StudentMatrix.studentRows('ProcessSelected')) {
      var object = StudentMatrix.iterators[iterator](row);
      StudentMatrix.plugins[plugin].processor(object);
    }
    app.close();
    return app;
  }

  // If the button wasn't clicked, this was a call from the check boxes. Switch 1/0 values.
  var processColumn = StudentMatrix.getColumn('process');
  var cell = StudentMatrix.mainSheet().getRange(eventInfo.parameter.source, processColumn);
  if (cell.getValue() == 1) {
    cell.setValue(0);
  }
  else {
    cell.setValue(1);
  }
}

// Declares the empty properties, so it can be populated by plugins.
StudentMatrix.plugins = {};
StudentMatrix.iterators = {};

// One iterator used by core, for selecting students.
StudentMatrix.iterators.getRowValues = function(row) {
  return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn() - 1).getValues();
}
