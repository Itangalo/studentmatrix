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
  // Declares all menu entries for this module.
  menuEntries : {
    settingsDialog : 'Settings',
  },
  // Declare required properties for components of type 'settings'.
  properties : {
    group : 'string',
    optionsBuilder : 'function',
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

    var panel = app.createVerticalPanel().setId('settingsPanel');//.setHeight('100%');
    app.add(panel);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  // Handler for displaying settings for a selected group.
  showSettings : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    var panel = app.getElementById('settingsPanel');
    panel.clear();

    // The 'null' value is used for groups that are not groups.
    if (eventInfo.parameter.settingsGroup == 'null') {
      return app;
    }
    // If we have a proper group; display all settings in the group.
    else {
      var saveHandler = StudentMatrix.addModuleHandler('settings', 'saveSettings');
      // Get all the settings in this group and loop through them.
      StudentMatrix.loadComponents('settings');
      var settings = StudentMatrix.getComponentsByGroup('settings')[eventInfo.parameter.settingsGroup];
      for (var setting in settings) {
        // Fetch default values from the component, then overwrite with any manually set properties.
        var options = StudentMatrix.components.settings[setting].options;
        for (var option in options) {
          options[option] = StudentMatrix.getProperty(option) || options[option];
        }
        // Call the options builder for the setting, populating the panel with form elements.
        StudentMatrix.components.settings[setting].optionsBuilder(saveHandler, panel, options);
      }

      var hidden = app.createHidden('settings', JSON.stringify(settings));
      app.add(hidden);
      saveHandler.addCallbackElement(hidden);
      panel.add(app.createHTML('<hr />'));
      // Add a button to save the settings.
      panel.add(app.createButton('Save group settings', saveHandler));
    }
  },

  // Handler for saving settings for a selected group.
  saveSettings : function(eventInfo) {
    StudentMatrix.toast('Saved settings for this group.')
    // Get all the settings components that should be saved.
    StudentMatrix.loadComponents('settings');
    var settings = JSON.parse(eventInfo.parameter.settings);
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
    return UiApp.getActiveApplication();
  },

  // Handler for closing the settings dialog.
  closeSettings : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  },
}

// Settings that should be included in StudentMatrix core.
StudentMatrix.plugins.core = {
  settings : {
    aSetting : {
      options : {
        color : 'blue',
        file : '',
      },
      optionsBuilder : function(handler, container, defaults) {
        var app = UiApp.getActiveApplication();
        var textBox = app.createTextBox().setName('color').setText(defaults.color);
        container.add(textBox);
        handler.addCallbackElement(textBox);

        container.add(app.createHTML('File ID'));
        var file = app.createTextBox().setName('file').setText(defaults.file).setId('file');
        handler.addCallbackElement(file);
        var filePicker = StudentMatrix.addPluginHandler('core', 'filePickerShow');
        var pickerButton = app.createButton('Select file', filePicker);
        container.add(file).add(pickerButton);

        return app;
      },
    },
  },
  handlers : {
    filePickerShow : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('core', 'filePickerSelect');
      app.createDocsListDialog().setDialogTitle('Select file').showDocsPicker().addSelectionHandler(handler);
      return app;
    },
    filePickerSelect : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('file').setText(eventInfo.parameter.items[0].id);
      return app;
    },
  },
}
