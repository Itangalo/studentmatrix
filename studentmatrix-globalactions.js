/**
 * @file
 * Module that allows global actions to be run, on the master sheet or so.
 * Introduces the 'globalActions' component. @TODO: This module is mainly copied from the
 * StudentActions module -- in a perfect world there would be code reuse instead.
 */

// Menu alias: Dialog for running actions on students.
function globalActionsDialog() {
  StudentMatrix.modules.globalActions.actionsDialog();
};

// Declares the GlobalActions module.
StudentMatrix.modules.globalActions = {
  // Declares all menu entries for this module.
  menuEntries : {
    globalActionsDialog : 'Run actions on the master sheet',
  },
  // Declare required properties for components of type 'globalActions'.
  properties : {
    name : 'string',
    group : 'string',
    description : 'string',
    processor : 'function',
  },
  
  // Displays dialog for running globalActions. Starting point for this module.
  actionsDialog : function() {
    StudentMatrix.loadComponents('globalActions');
    
    var app = UiApp.createApplication().setTitle('Run global actions');
    var descriptionHandler = StudentMatrix.addModuleHandler('globalActions', 'showDescriptions');

    // Build a select list of the actions, by group.
    var actionsList = app.createListBox().setId('SelectedAction').setName('SelectedAction');
    var componentList = StudentMatrix.getComponentsByGroup('globalActions');
    for (group in componentList) {
      actionsList.addItem('-- ' + group + ' --', null);
      for (component in componentList[group]) {
        actionsList.addItem(componentList[group][component], component);
      }
    }
    actionsList.addChangeHandler(descriptionHandler);
    app.add(actionsList);

    // Add two elements for description and help link, to be populated later.
    app.add(app.createLabel('', true).setId('ActionDescription'));
    app.add(app.createAnchor('', false, '').setId('ActionHelpLink'));
    
    // Add the button for running actions.
    var optionsHandler = StudentMatrix.addModuleHandler('globalActions', 'optionsHandler');
    optionsHandler.addCallbackElement(actionsList);

    app.add(app.createButton('Run the action', optionsHandler).setId('Process').setEnabled(false));
    
    // We also have spot for an error message, should there be one.
    app.add(app.createLabel('', true).setId('ErrorMessage'));

    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  // Handler for updating descriptions and help link for selected actions.
  showDescriptions : function(eventInfo) {
    StudentMatrix.loadComponents('globalActions');
    var component = eventInfo.parameter.SelectedAction;
    var app = UiApp.getActiveApplication();

    // Fetch and reset some texts in the form.
    var description = app.getElementById('ActionDescription');
    var helpLink = app.getElementById('ActionHelpLink');
    var errorMessage = app.getElementById('ErrorMessage');
    description.setText('');
    helpLink.setHTML('');
    errorMessage.setText('');

    // If the selected action is actually a group, disable button and quit.
    if (component == 'null') {
      app.getElementById('Process').setEnabled(false);
      return app;
    }

    // Set description and help links, if available.
    if (typeof StudentMatrix.components.globalActions[component].description == 'string') {
      description.setText(StudentMatrix.components.globalActions[component].description);
    }
    if (typeof StudentMatrix.components.globalActions[component].helpLink == 'string') {
      helpLink.setHref(StudentMatrix.components.globalActions[component].helpLink).setHTML('Help page<br />');
    }
    
    // Run basic validator on the component, if available.
    if (typeof StudentMatrix.components.globalActions[component].validator == 'function') {
      if (StudentMatrix.components.globalActions[component].validator() != null) {
        errorMessage.setText('Cannot run action: ' + StudentMatrix.components.globalActions[component].validator());
        app.getElementById('Process').setEnabled(false);
        return app;
      }
    }
    
    // All systems go. Enable the ok button.
    app.getElementById('Process').setEnabled(true);
    
    return app;
  },

  // Displays any options for an action, before running it.
  optionsHandler : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    // Get the component to run and which mode to run in. Add as hidden elements.
    var component = eventInfo.parameter.SelectedAction;
    var mode = eventInfo.parameter.source;
        
    // Check for an options builder for the component. If found, display a form with options.
    StudentMatrix.loadComponents('globalActions');
    if (typeof StudentMatrix.components.globalActions[component].optionsBuilder == 'function') {
      // Create a handler and call the options builder to add any form elements.
      var handler = StudentMatrix.addModuleHandler('globalActions', 'optionsProcessor');
      StudentMatrix.components.globalActions[component].optionsBuilder(handler);

      // Add the component and mode as hidden widgets, to pass on their information.
      var componentWidget = app.createHidden('component', component).setId('component');
      handler.addCallbackElement(componentWidget);
      app.add(componentWidget);

      app.add(app.createHTML('<hr />'));
      app.add(app.createButton('Cancel', handler).setId('Cancel'));
      app.add(app.createButton('OK', handler).setId('OK'));
      SpreadsheetApp.getActiveSpreadsheet().show(app);
    }
    // If no options builder is found, just call the action execution method without any options.
    else {
      this.componentExecute(component);
    }
  },
  
  // Handler for the componentOptionsDialog, allowing OK and Cancel.
  optionsProcessor : function(eventInfo) {
    // If it wasn't the OK button being clicked, close the dialog -- we're done.
    if (eventInfo.parameter.source != 'OK') {
      app.close();
      return app;
    }
    // If it was the OK button that was clicked: build options and call the action.
    else {
      StudentMatrix.loadComponents('globalActions');
      var app = UiApp.getActiveApplication();
      var component = eventInfo.parameter.component;

      // If there is an optionsProcessor declared in the component, use it.
      if (typeof StudentMatrix.components.globalActions[component].optionsProcessor == 'function') {
        var options = StudentMatrix.components.globalActions[component].optionsProcessor(eventInfo);
      }
      // If no optionsProcessor was found, just look for values for the declared options.
      else {
        // Load default options from the action component, overwrite with any set in the eventInfo.
        var options = StudentMatrix.components.globalActions[component].options;
        for (var option in StudentMatrix.components.globalActions[component].options) {
          options[option] = eventInfo.parameter[option];
        }
      }
      
      // Execute the action with the given options, in the given mode.
      this.componentExecute(component, options);
      return app;
    }
  },
  
  // Calls the actual action and runs it.
  componentExecute : function(component, options) {
    // This process may be slow, so it makes sense to display a message while processing.
    StudentMatrix.toast('Running action...');
    UiApp.getActiveApplication().close();

    StudentMatrix.components.globalActions[component].processor(options);
    StudentMatrix.toast('Action completed.');
  },
};
