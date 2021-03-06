// Loads a menu when opening or installing StudentMatrix.
function onOpen() {
  StudentMatrix.modules.menu.buildMenuEntries();
}
function onInstall() {
  StudentMatrix.modules.menu.buildMenuEntries();
}

/**
 * Some core functionality and properties for StudentMatrix.
 */
var StudentMatrix = (function() {
  var modules = {};
  var components = {};
  var plugins = {};

  // Returns the sheet containing main student information.
  mainSheet = function() {
    // Default is that main sheet name is stored as a property.
    var mainSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(StudentMatrix.getProperty('StudentMatrixMainSheetName'));
    if (mainSheet != null && mainSheet.toString() == 'Sheet') {
      return mainSheet;
    }

    // If the sheet couldn't be loaded, it might never have been set or it could be renamed.
    // We check these cases, and store relevant properties for quicker fetching next time.
    var mainSheetID = StudentMatrix.getProperty('StudentMatrixMainSheetID');
    if (mainSheetID == null) {
      var mainSheetName = SpreadsheetApp.getActiveSheet().getName();
      var mainSheetID = SpreadsheetApp.getActiveSheet().getSheetId();
      StudentMatrix.setProperty(mainSheetName, 'StudentMatrixMainSheetName');
      StudentMatrix.setProperty(mainSheetID, 'StudentMatrixMainSheetID');
      StudentMatrix.toast('No main sheet is set: using the active sheet. Use settings if you wish to change which sheet to use as main sheet.');
      return SpreadsheetApp.getActiveSheet();
    }
    else {
      var mainSheet = StudentMatrix.plugins.mainsheet.getSheetByID(SpreadsheetApp.getActiveSpreadsheet(), mainSheetID);
      StudentMatrix.setProperty(mainSheet.getName(), 'StudentMatrixMainSheetName');
      StudentMatrix.toast('Main sheet seems to be renamed: updating the settings.');
      return mainSheet;
    }
  };

  // Three functions keeping track of which rows are used for storing students.
  firstStudentRow = function() {
    return 2;
  };
  lastStudentRow = function() {
    return StudentMatrix.mainSheet().getLastRow();
  };
  numberOfStudents = function() {
    return StudentMatrix.lastStudentRow() - StudentMatrix.firstStudentRow() + 1;
  };

  /**
   * Loads a JSON parsed property.
   *
   * If subPropertyName is set, the property will be fetched from the object stored
   * on propertyName.
   */
  getProperty = function(propertyName, subPropertyName, useFallback) {
    try {
      var value = JSON.parse(ScriptProperties.getProperty(propertyName));
    }
    catch(e) {
      value = null;
    }
    if (typeof subPropertyName == 'string') {
      if (value == null) {
        return;
      }
      else {
        return value[subPropertyName];
      }
    }

    // If there is no matching property, try to find fallback values defined by a setting.
    if (value == null && useFallback == true) {
      value = StudentMatrix.modules.settings.getPropertyFallback(propertyName);
      if (value != null) {
        // Notify of default value being used, and store it as a property for quicker fetching next time.
        StudentMatrix.toast('Reading and storing default value for property "' + propertyName + '".');
        StudentMatrix.setProperty(value, propertyName);
      }
    }
    return value;
  };

  /**
   * Stores a variable as a JSON parsed script property.
   *
   * If subPropertyName is set, propertyName will be treated as an object, whose property
   * 'subPropertyName' will be set to value. That is, you will get
   * properties[propertyName][subPropertyName] = value.
   */
  setProperty = function(value, propertyName, subPropertyName) {
    // Setting the value to 'undefined' should be treated as removing the property.
    if (value == undefined) {
      StudentMatrix.deleteProperty(propertyName, subPropertyName);
    }

    if (typeof subPropertyName != 'undefined') {
      var object = StudentMatrix.getProperty(propertyName);
      if (object == null || typeof object != 'object') {
        object = {};
      }
      object[subPropertyName.toString()] = value;
      StudentMatrix.setProperty(object, propertyName);
    }
    else {
      ScriptProperties.setProperty(propertyName, JSON.stringify(value));
    }
  };

  /**
   * Removes a property, or sub property, set by StudentMatrix.setProperty().
   */
  deleteProperty = function(propertyName, subPropertyName) {
    if (subPropertyName == undefined) {
      ScriptProperties.deleteProperty(propertyName);
    }
    else {
      var parentProperty = StudentMatrix.getProperty(propertyName);
      if (parentProperty[subPropertyName] != undefined) {
        delete parentProperty[subPropertyName];
        StudentMatrix.setProperty(parentProperty, propertyName);
      }
    }
  }

  // Displays a toaster message, with an optional title.
  toast = function(message, title) {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title || '');
  };

  /**
   * Function allowing dynamic calls to methods and sub methods of StudentMatrix.
   *
   * This function is used for working around Google Spreadsheet's limitation in
   * menu callbacks. The methodName is the path to the method ('StudentMatrix.'
   * excluded), and arguments contains an array of arguments to pass to the method.
   * Object and stack are used for internal and recursive purposes only.
   */
  callRecursive = function(methodName, arguments, object, stack) {
    if (object == undefined) {
      object = this;
      stack = 'StudentMatrix';
    }

    // If we are at the end of the recursion, run the method and return its output.
    if (methodName.indexOf('.') == -1) {
      if (typeof object[methodName] == 'function') {
        // The 'apply' thing allows us to pass arguments. Quite useful.
        return object[methodName].apply(this, arguments);
      }
      else {
        throw 'Error: ' + stack + '.' + methodName + ' is not a function.';
        return;
      }
    }

    // If we are *not* at the end of the recursion, dig one level deeper into the object
    // and call this same function for keep digging.
    var parts = methodName.split('.');
    var head = parts.shift();
    var subMethod = parts.join('.');

    if (typeof object[head] == 'undefined') {
      throw 'Property ' + head + ' in object ' + stack + ' is not defined.';
    }
    return this.callRecursive(subMethod, arguments, object[head], stack + '.' + head);
  };

  // Fetches properties of a certain type from both plugins and modules.
  getPluginAndModuleProperties = function(property) {
    var properties = {};
    var moduleStatus = StudentMatrix.getProperty('moduleStatus') || {};
    for (var module in modules) {
      if (typeof modules[module][property] == 'object' && moduleStatus[module] != 'autoDisabled' && moduleStatus[module] != 'manualDisabled') {
        for (var propertyID in modules[module][property]) {
          properties[propertyID] = modules[module][property][propertyID];
        }
      }
    }

    var pluginStatus = StudentMatrix.getProperty('pluginStatus') || {};
    for (var plugin in plugins) {
      if (typeof plugins[plugin][property] == 'object' && pluginStatus[plugin] != 'autoDisabled' && pluginStatus[plugin] != 'manualDisabled') {
        for (var propertyID in plugins[plugin][property]) {
          properties[propertyID] = plugins[plugin][property][propertyID];
        }
      }
    }

    return properties;
  };

  // Alias for allowing quicker fetching of columns declared by plugins and modules.
  getColumns = function() {
    return getPluginAndModuleProperties('columns');
  };

  // Writes all columns declared by modules to the main sheet.
  setUpColumns = function() {
    var columns = getColumns();
    for (var columnID in columns) {
      if (parseInt(StudentMatrix.getProperty('StudentMatrixColumns', columnID)) > 0) {
        StudentMatrix.mainSheet().getRange(1, StudentMatrix.getProperty('StudentMatrixColumns', columnID)).setValue(columns[columnID]);
      }
      else {
        var column = StudentMatrix.mainSheet().getLastColumn() + 1;
        StudentMatrix.mainSheet().getRange(1, column).setValue(columns[columnID]);
        StudentMatrix.setProperty(column, 'StudentMatrixColumns', columnID);
      }
    }
    StudentMatrix.mainSheet().setFrozenRows(StudentMatrix.firstStudentRow() - 1);
  };

  // Helper function for creating a handler pointing to a function within a module.
  addModuleHandler = function(moduleName, functionName) {
    var app = UiApp.getActiveApplication();
    var callback = app.createHidden('callback', JSON.stringify({base : 'modules', objectName : moduleName, functionName : functionName}));
    var handler = app.createServerHandler('StudentMatrixCallbackRouter').addCallbackElement(callback);
    return handler;
  };

  // Helper function for creating a handler pointing to a function within a plugin.
  addPluginHandler = function(pluginName, functionName) {
    var app = UiApp.getActiveApplication();
    var callback = app.createHidden('callback', JSON.stringify({base : 'plugins', objectName : pluginName, functionName : functionName}));
    var handler = app.createServerHandler('StudentMatrixCallbackRouter').addCallbackElement(callback);
    return handler;
  };

  // Builds a list of component groups, with each group containing the component names.
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

  // Loads all components of a particular type into StudentMatrix.components[componentType].
  loadComponents = function(componentType) {
    // Look through all plugins, and add all components of the relevant type to StudentMatrix.components.
    if (typeof components[componentType] != 'object') {
      components[componentType] = {};
    }
    var pluginStatus = StudentMatrix.getProperty('pluginStatus') || {};
    for (var plugin in plugins) {
      if (typeof plugins[plugin][componentType] == 'object' && pluginStatus[plugin] != 'autoDisabled' && pluginStatus[plugin] != 'manualDisabled') {
        for (var component in plugins[plugin][componentType]) {
          components[componentType][component] = plugins[plugin][componentType][component];
        }
      }
    }
  };

  // Takes a string and replaces all '[column-NN]' with the values in the columns of a given student.
  replaceColumnTokens = function(string, row) {
    var columnValues = StudentMatrix.plugins.core.fetchers.allValues(row);
    // Note that the column values start on zero, while the user expects one. Thus the +1 shift.
    for (var column in columnValues) {
      while (string.indexOf('[column-' + (parseInt(column) + 1) + ']') > -1) {
        string = string.replace('[column-' + (parseInt(column) + 1) + ']', columnValues[column]);
      }
    }
    return string;
  };

  // Reveal the public methods and properties.
  return {
    modules : modules,
    plugins : plugins,
    components : components,
    mainSheet : mainSheet,
    firstStudentRow : firstStudentRow,
    lastStudentRow : lastStudentRow,
    numberOfStudents : numberOfStudents,
    setProperty : setProperty,
    getProperty : getProperty,
    deleteProperty : deleteProperty,
    callRecursive : callRecursive,
    getPluginAndModuleProperties : getPluginAndModuleProperties,
    getColumns : getColumns,
    setUpColumns : setUpColumns,
    toast : toast,
    getComponentsByGroup : getComponentsByGroup,
    addPluginHandler : addPluginHandler,
    addModuleHandler : addModuleHandler,
    loadComponents : loadComponents,
    replaceColumnTokens : replaceColumnTokens,
    version : '3.2',
    versionName : '3.0-RC2',
  }
})();

/**
 * Helper function routing handler calls to the proper method in module or plugin.
 *
 * This function belongs together with StudentMatrix.addModuleHandler() and
 * StudentMatrix.addPluginHandler().
 */
function StudentMatrixCallbackRouter(eventInfo) {
  var info = JSON.parse(eventInfo.parameter.callback);
  if (info.base == 'modules') {
    StudentMatrix[info.base][info.objectName][info.functionName](eventInfo);
  }
  else {
    StudentMatrix[info.base][info.objectName].handlers[info.functionName](eventInfo);
  }
  return UiApp.getActiveApplication();
}

/**
 * Menu entries and columns included in StudentMatrix core.
 */
StudentMatrix.modules.core = {
  name : 'Core',
  description : 'Core functionality for StudentMatrix',
  version : '1.4',
  required : true,
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-core.js',
  cell : 'D2',
  dependencies : {},

  columns : {
    process : 'Process',
    studentName : 'Student name',
    studentMail : 'Student email',
  }
};

// Fetchers included in StudentMatrix core.
StudentMatrix.plugins.core = {
  name : 'Core',
  description : 'Core plugins for StudentMatrix',
  version : '1.0',
  required : true,
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-core.js',
  cell : 'D2',
  dependencies : {},

  fetchers : {
    studentColumnCell : function(row, columnID) {
      var columnNumber = StudentMatrix.getProperty('StudentMatrixColumns', columnID);
      if (columnNumber == undefined) {
        return false;
      }
      return StudentMatrix.mainSheet().getRange(row, columnNumber);
    },
    studentColumnValue : function(row, columnID) {
      var columnNumber = StudentMatrix.getProperty('StudentMatrixColumns', columnID);
      if (columnNumber == undefined) {
        return false;
      }
      return StudentMatrix.mainSheet().getRange(row, columnNumber).getValue();
    },
    allValues : function(row) {
      return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn() - 1).getValues()[0];
    },

  },
}
