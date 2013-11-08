function onOpen() {
  var entries = [];
  entries.push({name : 'dev', functionName : 'dev'});
  entries.push({name : 'reset', functionName : 'reset'});
  entries.push({name : 'Run actions on students', functionName : 'actionsDialog'});
  entries.push({name : 'Setup columns', functionName : 'setupColumns'});

  SpreadsheetApp.getActiveSpreadsheet().addMenu('Development', entries);
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
  },
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
    var column = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
    for (var row = StudentMatrix.firstStudentRow(); row <= StudentMatrix.lastStudentRow(); row++) {
      if (StudentMatrix.mainSheet().getRange(row, column).getValue() == 1) {
        studentRows[row] = row;
      }
    }
  }
  if (mode == 'count') {
    studenRows = 0;
    var column = StudentMatrix.getProperty('StudentMatrixColumns', 'process');

    for (var row = StudentMatrix.firstStudentRow(); row <= StudentMatrix.lastStudentRow(); row++) {
      if (StudentMatrix.mainSheet().getRange(row, column).getValue() == 1) {
        studentRows++;
      }
    }
  }
  return studentRows;
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
    var object = settingsGet(propertyName);
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
 * Returns an object with all plugin groups, each group containing its plugins.
 */
StudentMatrix.getPluginsByGroup = function() {
  var plugins = {};
  for (var plugin in StudentMatrix.plugins) {
    var group = StudentMatrix.plugins[plugin].group;
    if (typeof group == 'undefined') {
      group = 'Other';
    }
    if (typeof plugins[group] == 'undefined') {
      plugins[group] = {};
    }
    plugins[group][plugin] = StudentMatrix.plugins[plugin].name;
  }
  return plugins;
}

/**
 * Displays a dialog used for selecting actions for processing student sheets.
 */
function actionsDialog() {
  var app = UiApp.createApplication().setTitle('Run actions on students');
  var handler = app.createServerHandler('actionsDialogHandler');

  var actionsList = app.createListBox().setId('SelectedAction').setName('SelectedAction');
  var pluginList = StudentMatrix.getPluginsByGroup();
  for (group in pluginList) {
    actionsList.addItem('-- ' + group + ' --', null);
    for (plugin in pluginList[group]) {
      actionsList.addItem(StudentMatrix.plugins[plugin].name, plugin);
    }
  }
  actionsList.addChangeHandler(handler);
  app.add(actionsList);
  handler.addCallbackElement(actionsList);

  app.add(app.createLabel('', true).setId('ActionDescription'));
  app.add(app.createAnchor('', false, '').setId('ActionHelpLink'));

  app.add(app.createButton('Run for all students', handler).setId('ProcessAll').setEnabled(false));
  app.add(app.createButton('Run for selected students (' + StudentMatrix.studentRows('count') + ')', handler).setId('ProcessSelected').setEnabled(false));
  app.add(app.createButton('Select students and run', handler).setId('SelectAndProcess').setEnabled(false));

  app.add(app.createLabel('', true).setId('ErrorMessage'));
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
    
    // If the selected action is actually a group, disable buttons and quit.
    if (plugin == 'null') {
      app.getElementById('ProcessAll').setEnabled(false);
      app.getElementById('ProcessSelected').setEnabled(false);
      app.getElementById('SelectAndProcess').setEnabled(false);
      return app;
    }

    // Set description and help links, if available.
    var description = app.getElementById('ActionDescription');
    description.setText('');
    if (typeof StudentMatrix.plugins[plugin].description == 'string') {
      description.setText(StudentMatrix.plugins[plugin].description);
    }

    var helpLink = app.getElementById('ActionHelpLink');
    helpLink.setHTML('');
    if (typeof StudentMatrix.plugins[plugin].helpLink == 'string') {
      helpLink.setHref(StudentMatrix.plugins[plugin].helpLink).setHTML('Help page<br />');
    }

    // Run basic validator on the plugin, if available.
    var errorMessage = app.getElementById('ErrorMessage');
    errorMessage.setText('');
    if (typeof StudentMatrix.plugins[plugin].validator == 'function') {
      if (StudentMatrix.plugins[plugin].validator() != null) {
        errorMessage.setText('Cannot run action: ' + StudentMatrix.plugins[plugin].validator());
        app.getElementById('ProcessAll').setEnabled(false);
        app.getElementById('ProcessSelected').setEnabled(false);
        app.getElementById('SelectAndProcess').setEnabled(false);
        return app;
      }
    }

    // All systems go. Enable the ok buttons.
    app.getElementById('ProcessAll').setEnabled(true);
    app.getElementById('ProcessSelected').setEnabled(true);
    app.getElementById('SelectAndProcess').setEnabled(true);

    return app;
  }

  // Call the relevant processor
  if (eventInfo.parameter.source == 'ProcessAll' || eventInfo.parameter.source == 'ProcessSelected') {
    var app = UiApp.getActiveApplication();
    var plugin = eventInfo.parameter.SelectedAction;
    StudentMatrix.pluginOptionsDialog(plugin, eventInfo.parameter.source, app);
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
  var processColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
  var nameColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'studentName');

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
    var plugin = eventInfo.parameter.SelectedAction;
    StudentMatrix.pluginOptionsDialog(plugin, 'ProcessSelected', app);
    return app;
  }

  // If the button wasn't clicked, this was a call from the check boxes. Switch 1/0 values.
  var processColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
  var cell = StudentMatrix.mainSheet().getRange(eventInfo.parameter.source, processColumn);
  if (cell.getValue() == 1) {
    cell.setValue(0);
  }
  else {
    cell.setValue(1);
  }
}

/**
 * Calls the plugin processors, to run actions on student rows.
 */
StudentMatrix.pluginOptionsDialog = function(plugin, mode, app) {
  if (typeof StudentMatrix.plugins[plugin].optionsBuilder == 'function') {
    var app = UiApp.getActiveApplication();
    var handler = app.createServerHandler('pluginOptionsDialogHandler');
    
    StudentMatrix.plugins[plugin].optionsBuilder(handler);
//    for (var option in StudentMatrix.plugins[plugin].options) {
//      var widget = StudentMatrix.plugins[plugin].options[option]();
//      widget.setId(option);
//      try {
//        widget.setName(option);
//      }
//      catch(e) {
//      }
//      app.add(widget);
//      handler.addCallbackElement(widget);
//    }
    app.add(app.createButton('Cancel', handler).setId('Cancel'));
    app.add(app.createButton('OK', handler).setId('OK'));
    var pluginWidget = app.createHidden('plugin', plugin).setId('plugin');
    var pluginMode = app.createHidden('mode', mode).setId('mode');
    handler.addCallbackElement(pluginWidget);
    handler.addCallbackElement(pluginMode);
    app.add(pluginWidget);
    app.add(pluginMode);
    SpreadsheetApp.getActiveSpreadsheet().show(app);
  }
  else {
    StudentMatrix.pluginExecute(plugin, mode);
  }
}

/**
 * Handler for the pluginOptionsDialog, allowing OK and Cancel.
 */
function pluginOptionsDialogHandler(eventInfo) {
  if (eventInfo.parameter.source == 'OK') {
    var app = UiApp.getActiveApplication();
    var plugin = eventInfo.parameter.plugin;
    var options = {};
    if (typeof StudentMatrix.plugins[plugin].options == 'object') {
      for (var option in StudentMatrix.plugins[plugin].options) {
//        StudentMatrix.options[option] = eventInfo.parameter[option];
        options[option] = eventInfo.parameter[option];
      }
    }
    StudentMatrix.pluginExecute(eventInfo.parameter.plugin, eventInfo.parameter.mode, options);
  }
}

StudentMatrix.pluginExecute = function(plugin, mode, options) {
  debug('running...');
  var iterator = StudentMatrix.plugins[plugin].iterator;
  for (var row in StudentMatrix.studentRows(mode)) {
    var object = StudentMatrix.iterators[iterator](row);
    StudentMatrix.plugins[plugin].processor(object, options);
  }
}

// Declares some empty properties, so it can be populated by plugins.
StudentMatrix.plugins = {};
StudentMatrix.iterators = {};
StudentMatrix.options = {};

// One iterator used by core, for selecting students.
StudentMatrix.iterators.getRowValues = function(row) {
  return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn() - 1).getValues();
}
