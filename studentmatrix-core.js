// Loads a menu when opening or installing StudentMatrix.
function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu('StudentMatrix', StudentMatrix.getMenuEntries());
}
function onInstall() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu('StudentMatrix', StudentMatrix.getMenuEntries());
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
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
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
  getProperty = function(propertyName, subPropertyName) {
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
  };

  /**
   * Stores a variable as a JSON parsed script property.
   *
   * If subPropertyName is set, propertyName will be treated as an object, whose property
   * 'subPropertyName' will be set to value. That is, you will get
   * properties[propertyName][subPropertyName] = value.
   */
  setProperty = function(value, propertyName, subPropertyName) {
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
  };

  // Displays a toaster message, with an optional title.
  toast = function(message, title) {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title || '');
  };

  // Fetches all menu entries from StudentMatrix modules.
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

  // Fetches all menu entries from StudentMatrix modules. (Private function.)
  getColumns = function() {
    var columns = {};
    for (var module in modules) {
      if (typeof modules[module].columns == 'object') {
        for (var columnID in modules[module].columns) {
          columns[columnID] = modules[module].columns[columnID];
        }
      }
    }
    return columns;
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
    for (var plugin in plugins) {
      if (typeof plugins[plugin][componentType] == 'object') {
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
    getMenuEntries : getMenuEntries,
    setUpColumns : setUpColumns,
    toast : toast,
    getComponentsByGroup : getComponentsByGroup,
    addPluginHandler : addPluginHandler,
    addModuleHandler : addModuleHandler,
    loadComponents : loadComponents,
    replaceColumnTokens : replaceColumnTokens,
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
  menuEntries : {
    setUpColumns : 'Set up columns in the main sheet',
  },
  columns : {
    process : 'Process',
    studentName : 'Student name',
    studentMail : 'Student email',
  }
};

/**
 * Menu alias: Sets up column headers for all columns declared in StudentMatrix.columns.
 */
function setUpColumns() {
  StudentMatrix.setUpColumns();
}

// Fetchers included in StudentMatrix core.
StudentMatrix.plugins.core = {
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
