function onOpen() {
//  entries.push({name : 'Settings', functionName : 'StudentMatrixSettingsDialog'});
//  entries.push({name : 'Setup columns', functionName : 'setUpColumns'});
  
  SpreadsheetApp.getActiveSpreadsheet().addMenu('StudentMatrix', StudentMatrix.getMenuEntries());
}

/**
 * Sets up column headers for all columns declared in StudentMatrix.columns.
 */
function setUpColumns() {
  StudentMatrix.setUpColumns();
}

/**
 * A number of basic properties for StudentMatrix.
 */
var StudentMatrix = (function() {
  var modules = {};
  var components = {};
  var plugins = {};

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
  
  toast = function(message, title) {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title || '');
  };
  
//  addModule = function(moduleName, moduleDeclaration) {
//    modules[moduleName] = moduleDeclaration;
//  };
  
//  getComponent = function(componentType, componentName) {
//    return components[componentType][componentName];
//  };
  
  getMenuEntries = function() {
    var menuEntries = [];
    for (var module in modules) {
      if (typeof modules[module].menuEntries == 'object') {
        for (var entry in modules[module].menuEntries) {
          menuEntries.push({name : modules[module].menuEntries[entry], functionName : entry});
        }
        menuEntries.push(null);
      }
    }
    return menuEntries;
  };
  
  addPluginHandler = function(pluginName, functionName) {
    var app = UiApp.getActiveApplication();
    var callback = app.createHidden('callback', JSON.stringify({base : 'plugins', objectName : pluginName, functionName : functionName}));
    var handler = app.createServerHandler('StudentMatrixCallbackRouter').addCallbackElement(callback);
    return handler;
  };
  
  addModuleHandler = function(moduleName, functionName) {
    var app = UiApp.getActiveApplication();
    var callback = app.createHidden('callback', JSON.stringify({base : 'modules', objectName : moduleName, functionName : functionName}));
    var handler = app.createServerHandler('StudentMatrixCallbackRouter').addCallbackElement(callback);
    return handler;
  };

  getComponentsByGroup = function(type) {
    var groupedComponents = {};
    for (var component in components[type]) {
      var group = components[type][component].group;
      if (typeof group == 'undefined') {
        group = 'Other';
      }
      if (typeof groupedComponents[group] == 'undefined') {
        groupedComponents[group] = {};
      }
      groupedComponents[group][component] = components[type][component].name;
    }
    return groupedComponents;
  };
  
  loadComponents = function(componentType) {
    // Look through all plugins, and add all components of the relevant type to StudentMatrix.components.
    if (typeof components[componentType] != 'object') {
      components[componentType] = {};
    }
    for (var plugin in plugins) {
      if (typeof plugins[plugin][componentType] == 'object') {
        for (var component in plugins[plugin][componentType]) {
          components[componentType][component] = plugins[plugin][componentType][component];
        }
      }
    }
  };

  // Reveal the public methods and properties.
  return {
    mainSheet : mainSheet,
    firstStudentRow : firstStudentRow,
    lastStudentRow : lastStudentRow,
    numberOfStudents : numberOfStudents,
//    addModule : addModule,
    getMenuEntries : getMenuEntries,
    toast : toast,
    getComponentsByGroup : getComponentsByGroup,
//    getComponent : getComponent,
    addPluginHandler : addPluginHandler,
    addModuleHandler : addModuleHandler,
    plugins : plugins,
    loadComponents : loadComponents,
    components : components,
    modules : modules,
  }
})();

/**
 * Helper function routing handler calls to the proper method.
 */
function StudentMatrixCallbackRouter(eventInfo) {
  var info = JSON.parse(eventInfo.parameter.callback);
  if (info.base == 'modules') {
    StudentMatrix[info.base][info.objectName][info.functionName](eventInfo);
  }
  else {
    StudentMatrix[info.base][info.objectName].handlers[info.functionName](eventInfo);
  }
//  {base : 'plugins', objectName : pluginName, componentType : componentType, functionName : functionName}
  return UiApp.getActiveApplication();
}

/**
 * Column declarations included in StudentMatrix core.
 */
StudentMatrix.columns = {
  process : 'Process',
  studentName : 'Student name',
  studentMail : 'Student email',
}

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
StudentMatrixgetComponentsByGroup = function(type) {
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

StudentMatrix.setUpColumns = function() {
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
StudentMatrix.options = {};
StudentMatrix.settings = {};
//StudentMatrix.studentActions = {};
StudentMatrix.iterators = {};
