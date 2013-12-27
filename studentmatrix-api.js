/**
 * @file
 * Contains examples of how to write plugins for StudentMatrix, and some other
 * API docs.
 */

/**
 * Plugins are declared by adding an entry to StudentMatrix.plugins. This entry
 * contains declarations of whatever components are included in the plugin. Each
 * type of component are declared in its own way. Examples follow.
 */
StudentMatrix.plugins.example = {
  // Each plugin must provide a meta-description of itself, including version
  // number and an URL where code updates can be found. Version number should
  // increase in decimals when the API is not broken, and by integers when any
  // exposed API becomes broken. Dependencies are declared against the mininmum
  // API version -- dependency on core 1.1 also works with core 1.2 (but not
  // 2.0, as APIs may have changed between integer versions). Note that version
  // and dependencies are declared as strings, to allow incrementing 1.9 to
  // 1.10 (which is different from 1.1).
  name : 'Example plugin',
  description : 'One or two sentences describing what the plugin does.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-api.js',
  // The cell reference below refers to the spreadsheet on
  // https://docs.google.com/spreadsheet/ccc?key=0AjgECFpHWbvRdE4yVHZRcGxEamVWUE1TalBLby12blE
  // and may be used to broadcast information about new versions. Optional.
  cell : 'A1',
  dependencies : {
    core : '3.0',
    modules : {
      menu : '1.0',
    },
    plugins : {
      myPlugin : '1.1',
    },
  },

  // Any handlers that should be possible to call using StudentMatrix.addPluginHandler('pluginName', 'callbackFunction').
  // These handlers are normally used to process responses in forms, and they
  // should all take an argument containing the event information for the UiApp.
  // Normally they will also return the UiApp, to allow further processing (such
  // as closing it).
  handlers : {
    myHandler : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      // Do some stuff.
      return app;
    },
  },

  // 'settings' components are used to store globally available information.
  // Since a plugin can have multiple settings, they are declared as sub
  // properties.
  settings : {
    mySetting : {
      // The settings will be displayed with other settings in the same group.
      group : 'Examples',
    },

    // All options used by the setting are declared in the options property,
    // along with default values.
    options : {
      color : 'hotpink',
    },
    // The options builder takes care of building a form where the user changes
    // the settings. All elements should be added to the container. Any elements
    // that should be processed should be added to the handler. Any default
    // values are passed in the defaults parameter, to set start values of UI
    // elements. Default values are built using StudentMatrix.getProperty(), and
    // if nothing is found the defaults in the options property is used.
    optionsBuilder : function(handler, container, defaults) {
      var app = UiApp.getActiveApplication();
      var textBox = app.createTextBox().setName('color').setText(defaults.color);
      container.add(textBox);
      handler.addCallbackElement(textBox);
    },
    // Normally, the options are read off the eventInfo when saving the settings
    // form, and stored using StudentMatrix.setProperty(). However, if more
    // complex processing is required you can declare an optionsSaver function.
    // This function must then take care of storing *all* the options for this
    // component.
    optionsSaver : function(eventInfo) {
      var processedValue;
      // Do complex stuff.
      StudentMatrix.setProperty(processedValue, 'settingID');
    },
  },

  // 'studentActions' components are actions that can be run on all or selected
  // students. Since a plugin can have multiple studentActions, they are
  // declared as sub properties.
  studentActions : {
    myStudentAction : {
      name : 'Visible name of the action',
      group : 'Examples',
      description : 'A longer description, explaining to the user what this action does in a sentence or two.',
      helpLink : 'http://link.to/help-page-with-further-information',

      // The processor is the method doing the actual work on each student entry.
      // If your action uses options, they are passed in the options parameter.
      // If you for some reason want to know which row is being processed, that
      // is passed in the row parameter.
      processor : function(row, options) {
        // You will most likely want to use some fetchers, to get various data
        // derived from the student row.
        var studentNameCell = StudentMatrix.components.fetchers.studentName(row);

        studentNameCell.setFontWeight('bold');
        studentNameCell.setBackgroundColor(options.color);
      },

      // Validators can be used to disallow the action in some circumstances. If
      // no validator is declared, you can always run the action.
      validator : function() {
        // Run checks here. A null return means ok. A return of anything else
        // will be used as error message and displayed to the user.
        if ('ok' == true) {
          return;
        }
        else {
          return 'This action cannot be run on Thursdays.';
        }

      },

      // Options builders are used to display options to the user before running
      // the action. The builder is passed a handler and a container. All
      // elements that should be displayed should be added to the container (to
      // allow scrolling), and any elements that should be evaluated must be
      // added to the handler.
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('Background color'));
        var color = app.createTextBox().setId('color').setName('color');
        container.add(color);
        handler.addCallbackElement(color);
      },
      // Any entries in the options property will be used to look for values
      // added by the options builder. It will also be used for setting default
      // values, in case they aren't populated by the builder. This is also a
      // neat trick to build expensive objects only once.
      options : {
        color : 'blue',
        someOtherOption : 'some other default value',
        expensiveObject : SpreadsheetApp.getActiveRange(),
      },
      // In case the plugin options cannot just be read from eventInfo, you need
      // an optionsProcessor. If you declare this function, it needs to take
      // responsibility for building *all* your options -- not just the
      // difficult ones.
      optionsProcessor : function(eventInfo) {
        var options = {};
        options.color = ensureColorCode(eventInfo.color);
        options.someOtherOption = eventInfo.someOtherOption;
        // Note that any default values are overwritten.
        options.expensiveObject = SpreadsheetApp.getActiveRange();
        return options;
      },
    },
  },

  // Fetchers are usually called from within studentActions, to fetch data
  // related to a particular student row. Fetchers usually only take the row
  // number as argument, and use that to build whatever item is relevant.
  // Returning false signals that the fetch process could not be completed.
  // Since a plugin can have multiple fetchers, they are declared as sub
  // properties.
  fetchers : {
    // This example fetcher returns the cell containing the student's name.
    // There is actually a fetcher 'studentColumnCell' and 'studentColumnValue'
    // that could do this fetching (and you really should reuse existing
    // fetchers rather than building your own), but this still serves as an
    // example.
    myfetcher : function(row) {
      return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentName'));
    },
  },

  // 'globalActions' components are similar to studentActions, but are only run
  // once (and not on any student). Since a plugin can have multiple
  // globalActions, they are declared as sub properties.
  globalActions : {
    myGlobalAction : {
      name : 'Visible name of the action',
      group : 'Examples',
      description : 'A longer description, explaining to the user what this action does in a sentence or two.',
      helpLink : 'http://link.to/help-page-with-further-information',

      // The processor is the method doing the actual work.
      // If your action uses options, they are passed in the options parameter.
      processor : function(options) {
        // Copy a file, send an e-mail, insert a new tab into the spreadsheet,
        // or just display a message. Whatever you want to do with the action.
        Browser.msgBox(options.message);
      },

      // See the example studentAction.
      validator : function() {
      },

      // See the example studentAction.
      optionsBuilder : function(handler, container) {
      },
      options : {
      },
      optionsProcessor : function(eventInfo) {
      },
    },
  },
};

/**
 * Modules add new types of functionality to StudentMatrix (which are usually
 * implemented by plugins), and usually contain a lot of methods and logic. New
 * modules are declared by adding an entry to StudentMatrix.modules. Some module
 * properties are read by StudentMatrix and have special meaning -- see example
 * below.
 *
 * If you want to call a method inside a module as a UI handler, you can do this
 * by using StudentMatrix.addModuleHandler('moduleName', 'callbackFunction').
 */
StudentMatrix.modules.example = {
  // See example of plugin for explanation of this meta-description.
  name : 'Example module',
  description : 'One or two sentences describing what the module does.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-api.js',
  cell : 'A1',
  dependencies : {
    core : '3.0',
    modules : {
      menu : '1.0',
    },
    plugins : {
      myPlugin : '1.1',
    },
  },

  // 'columns' property adds columns that is used by your module. You get the
  // assigned column number through StudentMatrix.getProperty('StudentMatrixColumns', columnID).
  // Note that the user must run the action to set up columns manually.
  columns : {
    myColumnID : 'Visible lable for the column',
    myColumnID2 : 'Another label',
  },

  // 'menuEntries' property adds menu entries to the StudentMatrix menu. Note
  // that all callback functions must be global, due to how the Google script
  // works. Best practice is to just add an alias function, and let that
  // function call a method in your module.
  menuEntries : {
    myCallbackFunction : 'Command to be displayed in menu',
  },
};

// Remove the declarations above, so they aren't implemented.
delete StudentMatrix.plugins.example;
delete StudentMatrix.modules.example;
