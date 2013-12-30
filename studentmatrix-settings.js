/**
 * @file
 * Module that allows global settings. Introduces the 'settings' component.
 */

// Menu alias: Opens the settings dialog.
function settingsDialog() {
  StudentMatrix.modules.settings.settingsDialog();
}

/**
 * Module for handling StudentMatrix settings.
 */
StudentMatrix.modules.settings = {
  name : 'Settings module',
  description : 'Manages global settings for StudentMatrix.',
  version : '1.2',
  required : true,
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-settings.js',
  cell : 'D5',
  dependencies : {
    core : '3.0',
  },

  // Declares all menu entries for this module.
  menuEntries : {
    settingsDialog : 'Settings',
  },
  // Declare required properties for components of type 'settings'.
  properties : {
    group : 'string',
    optionsBuilder : 'function',
  },

  // Looks for any settings component declaring the given property, and returns its default value.
  getPropertyFallback : function(property) {
    StudentMatrix.loadComponents('settings');
    for (var setting in StudentMatrix.components.settings) {
      for (var option in StudentMatrix.components.settings[setting].options) {
        if (option == property && StudentMatrix.components.settings[setting].options[option] != null) {
          return StudentMatrix.components.settings[setting].options[option];
        }
      }
    }
    return null;
  },

  // The dialog for displaying StudentMatrix settings. Main starting point for this module.
  settingsDialog : function() {
    StudentMatrix.loadComponents('settings');
    var settings = StudentMatrix.getComponentsByGroup('settings');

    var app = UiApp.createApplication().setTitle('StudentMatrix settings');
    var showHandler = StudentMatrix.addModuleHandler('settings', 'showSettings');
    var groupSelector = app.createListBox().setName('settingsGroup').addChangeHandler(showHandler);
    groupSelector.addItem('Select group of settings', null);
    for (var group in settings) {
      groupSelector.addItem(group);
    }
    app.add(groupSelector);

    var panel = app.createVerticalPanel().setId('settingsPanel').setWidth('100%');
    var scroller = app.createScrollPanel(panel).setAlwaysShowScrollBars(true).setHeight('90%').setWidth('100%');
    app.add(scroller);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  // Handler for displaying settings for a selected group. If a preselected group is
  // passed, settings for that group will be displayed as a stand-alone dialog.
  showSettings : function(eventInfo, preselected) {

    // If we are passed eventInfo rather than a preselected choice, get the
    // settings panel so we can populate it.
    if (preselected == undefined) {
      var settingsGroup = eventInfo.parameter.settingsGroup;
      var app = UiApp.getActiveApplication();
      var panel = app.getElementById('settingsPanel');
      panel.clear();
      // The 'null' value is used for groups that are not groups.
      if (eventInfo.parameter.settingsGroup == 'null') {
        return app;
      }
    }
    // If we are passed a preselected group rather than eventInfo, build a new app
    // and add a panel where we put the settings information.
    else {
      var settingsGroup = preselected;
      var app = UiApp.createApplication().setTitle(preselected);
      var panel = app.createVerticalPanel().setId('settingsPanel').setWidth('100%');
      var scroller = app.createScrollPanel(panel).setAlwaysShowScrollBars(true).setHeight('90%').setWidth('100%');
      app.add(scroller);
    }

    var saveHandler = StudentMatrix.addModuleHandler('settings', 'saveSettings');
    // Get all the settings in this group and loop through them.
    StudentMatrix.loadComponents('settings');
    var settings = StudentMatrix.getComponentsByGroup('settings')[settingsGroup];
    for (var setting in settings) {
      // Fetch default values from the component, then overwrite with any manually set properties.
      var options = StudentMatrix.components.settings[setting].options;
      for (var option in options) {
        options[option] = StudentMatrix.getProperty(option) || options[option];
      }
      // Call the options builder for the setting, populating the panel with form elements.
      StudentMatrix.components.settings[setting].optionsBuilder(saveHandler, panel, options);
    }

    var hidden = app.createHidden('settingsgroup', settingsGroup);
    app.add(hidden);
    saveHandler.addCallbackElement(hidden);
    panel.add(app.createHTML('<hr />'));
    // Add a button to save the settings.
    panel.add(app.createButton('Save group settings', saveHandler));

    // If we act on a preselected group, we must make the UI appear before we're done.
    if (preselected != undefined) {
      saveHandler.addCallbackElement(app.createHidden('closeOnSave', true));
      SpreadsheetApp.getActiveSpreadsheet().show(app);
      return app;
    }
  },

  // Handler for saving settings for a selected group.
  saveSettings : function(eventInfo) {
    StudentMatrix.toast('Saved settings for this group.')
    // Get all the settings components in this group.
    StudentMatrix.loadComponents('settings');
    var settings = StudentMatrix.getComponentsByGroup('settings')[eventInfo.parameter.settingsgroup];
    for (var setting in settings) {
      // If there is a special optionsSaver in the component, use it.
      if (typeof StudentMatrix.components.settings[setting].optionsSaver == 'function') {
        StudentMatrix.components.settings[setting].optionsSaver(eventInfo);
      }
      // If not, just save the values of the options, as stored in the eventInfo.
      else {
        for (var option in StudentMatrix.components.settings[setting].options) {
          StudentMatrix.setProperty(eventInfo.parameter[option], option);
        }
      }
    }
    if (eventInfo.parameter.closeOnSave == true) {
      UiApp.getActiveApplication().close();
    }
    return UiApp.getActiveApplication();
  },

  // Handler for closing the settings dialog.
  closeSettings : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  },
}
