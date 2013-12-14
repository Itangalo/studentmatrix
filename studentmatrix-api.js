/**
 * @file
 * Contains examples of how to write plugins for StudentMatrix, and some other API docs.
 */

/**
 * Plugins are declared by adding an entry to StudentMatrix.plugins. This entry
 * contains declarations of whatever components are included in the plugin. Each
 * type of component are declared in its own way. Examples follow.
 */
StudentMatrix.plugins.example = {
  // Any handlers that should be possible to call using StudentMatrix.addPluginHandler('pluginName', 'callbackFunction').
  // These handlers are normally used to process responses in forms, and they should all
  // take an argument containing the event information for the UiApp. Normally they will
  // also return the UiApp, to allow further processing (such as closing it).
  handlers : {
    myHandler : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      // Do some stuff.
      return app;
    },
  },

  // 'settings' components are used to store globally available information.
  // Since a plugin can have multiple settings, they are declared as sub properties.
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
    // form, and stored using StudentMatrix.setProperty(). However, if more complex
    // processing is required you can declare an optionsSaver function. This function
    // must then take care of storing *all* the options for this component.
    optionsSaver : function(eventInfo) {
      var processedValue;
      // Do complex stuff.
      StudentMatrix.setProperty(processedValue, 'settingID');
    },
  },
  
  // 'studentActions' components are actions that can be run on all or selected students.
  // Since a plugin can have multiple studentActions, they are declared as sub properties.
  studentActions : {
    myStudentAction : {
      name : 'Visible name of the action',
      group : 'Examples',
      description : 'A longer description, explaining to the user what this action does in a sentence or two.',
      helpLink : 'http://link.to/help-page-with-further-information',
      
      // The processor is the method doing the actual work on each student entry.
      // The item it takes as parameter is prepared by the iterator and could be anything the
      // iterator throws together (such as a range of the student's sheet, the student e-mail,
      // or an object containing a combination of a lot of things).
      // If your action uses options, they are passed in the options parameter.
      processor : function(item, options) {
        item.setFontWeight('bold');
        item.setBackgroundColor(options.color);
      },
      // The iterator is the name of the iterator this action uses. Reuse existing iterators
      // in other plugins if they suit your needs.
      iterator : 'myIterator',
      
      // Validators can be used to disallow the action in some circumstances. If no validator
      // is declared, you can always run the action.
      validator : function() {
        // Run checks here. A null return means ok. A return of anything else will be used as
        // error message and displayed to the user.
        if ('ok' == true) {
          return;
        }
        else {
          return 'This action cannot be run on Thursdays.';
        }
        
      },

      // Options builders are used to display options to the user before running the action.
      // The builder is passed a handler, and must add any elements that should be evaluated
      // to this handler. Use the active UI application to add anything that should be displayed.
      optionsBuilder : function(handler) {
        var app = UiApp.getActiveApplication();
        app.add(app.createHTML('Background color'));
        var color = app.createTextBox().setId('color').setName('color');
        app.add(color);
        handler.addCallbackElement(color);
      },
      // Any entries in the options property will be used to look for values added by the options
      // builder. It will also be used for setting default values, in case they aren't populated
      // by the builder.
      options : {
        color : 'blue',
        someOtherOption : 'some other default value',
      },
      // In case the plugin options cannot just be read from eventInfo, you need an optionsProcessor.
      // If you declare this function, it needs to take responsibility for building *all* your
      // options -- not just the difficult ones.
      optionsProcessor : function(eventInfo) {
        var options = {};
        options.color = ensureColorCode(eventInfo.color);
        options.someOtherOption = eventInfo.someOtherOption;
        return options;
      },
    },
  },
  
  /**
   * Iterators are used to build items that should be processed by studentActions. They are passed
   * a row number, and return whatever type of item the studentAction expects. Returning false
   * signals that the row should be skipped.
   * Since a plugin can have multiple iterators, they are declared as sub properties.
   */
  iterators : {
    // This example iterator returns the cell containing the student's name.
    myIterator : function(row) {
      return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentName'));
    },
  },

  // 'globalActions' components are similar to studentActions, but are only run once (and
  // not on any student).
  // Since a plugin can have multiple globalActions, they are declared as sub properties.
  globalActions : {
    myGlobalAction : {
      name : 'Visible name of the action',
      group : 'Examples',
      description : 'A longer description, explaining to the user what this action does in a sentence or two.',
      helpLink : 'http://link.to/help-page-with-further-information',
      
      // The processor is the method doing the actual work.
      // If your action uses options, they are passed in the options parameter.
      processor : function(options) {
        // Copy a file, send an e-mail, insert a new tab into the spreadsheet. Or just display a message.
        Browser.msgBox(options.message);
      },
      
      // See the example studentAction.
      validator : function() {
      },

      // See the example studentAction.
      optionsBuilder : function(handler) {
      },
      options : {
      },
      optionsProcessor : function(eventInfo) {
      },
    },
  },
};

/**
 * Modules add new types of functionality to StudentMatrix (which are usually implemented
 * by plugins), and usually contain a lot of methods and logic. New modules are declared
 * by adding an entry to StudentMatrix.modules. Some module properties are read by
 * StudentMatrix and have special meaning -- see example below.
 *
 * If you want to call a method inside a module as a UI handler, you can do this by using
 * StudentMatrix.addModuleHandler('moduleName', 'callbackFunction').
 */
StudentMatrix.modules.example = {
  // 'columns' property adds columns that is used by your module. You get the assigned
  // column number through StudentMatrix.getProperty('StudentMatrixColumns', columnID).
  // Note that the user must run the action to set up columns manually.
  columns : {
    myColumnID : 'Visible lable for the column',
    myColumnID2 : 'Another label',
  },
  
  // 'menuEntries' property adds menu entries to the StudentMatrix menu. Note that all
  // callback functions must be global, due to how the Google script works. Best practice
  // is to just add an alias function, and let that function call a method in your module.
  menuEntries : {
    myCallbackFunction : 'Command to be displayed in menu',
  },
};

StudentMatrix.plugins.example = {};
StudentMatrix.modules.example = {};
