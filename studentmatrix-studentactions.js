/**
 * @file
 * Module that allows actions to be run on all or selected students.
 * Introduces the 'studentActions' and 'iterators' components.
 */

// Menu alias: Dialog for running actions on students.
function studentActionsDialog() {
  StudentMatrix.modules.studentActions.actionsDialog();
};

// Declares the StudentActions module.
StudentMatrix.modules.studentActions = {
  // Declares all menu entries for this module.
  menuEntries : {
    studentActionsDialog : 'Run actions on students',
  },
  // Declare required properties for components of type 'studentActions'.
  properties : {
    name : 'string',
    group : 'string',
    description : 'string',
    iterator : 'string',
    processor : 'function',
  },

  // Displays dialog for running studentActions. Starting point for this module.
  actionsDialog : function() {
    StudentMatrix.loadComponents('studentActions');

    var app = UiApp.createApplication().setTitle('Run actions on students');
    var descriptionHandler = StudentMatrix.addModuleHandler('studentActions', 'showDescriptions');

    // Build a select list of the actions, by group.
    var actionsList = app.createListBox().setId('SelectedAction').setName('SelectedAction');
    var componentList = StudentMatrix.getComponentsByGroup('studentActions');
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

    // Add the buttons for running actions, in three different modes (and with two different handlers).
    var optionsHandler = StudentMatrix.addModuleHandler('studentActions', 'optionsHandler');
    var studentSelectHandler = StudentMatrix.addModuleHandler('studentActions', 'studentSelectHandler');
    optionsHandler.addCallbackElement(actionsList);
    studentSelectHandler.addCallbackElement(actionsList);

    app.add(app.createButton('Run for all students', optionsHandler).setId('ProcessAll').setEnabled(false));
    app.add(app.createButton('Run for selected students (' + this.studentRows('count') + ')', optionsHandler).setId('ProcessSelected').setEnabled(false));
    app.add(app.createButton('Select students and run', studentSelectHandler).setId('SelectAndProcess').setEnabled(false));

    // We also have spot for an error message, should there be one.
    app.add(app.createLabel('', true).setId('ErrorMessage'));

    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  /**
   * Returns an array with row numbers of all students that should be processed.
   *
   * The mode can either be 'ProcessAll' (gives all students), 'ProcessSelected'
   * (gives only the students where the process column is 1), or 'count'.
   * If the mode is set to 'count', the return is just the number of selected
   * students. Otherwise it is an array with keys/values being the student rows.
   */
  studentRows : function(mode) {
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
  },

  // Handler for updating descriptions and help link for selected actions.
  showDescriptions : function(eventInfo) {
    StudentMatrix.loadComponents('studentActions');
    var component = eventInfo.parameter.SelectedAction;
    var app = UiApp.getActiveApplication();

    // Fetch and reset some texts in the form.
    var description = app.getElementById('ActionDescription');
    var helpLink = app.getElementById('ActionHelpLink');
    var errorMessage = app.getElementById('ErrorMessage');
    description.setText('');
    helpLink.setHTML('');
    errorMessage.setText('');

    // If the selected action is actually a group, disable buttons and quit.
    if (component == 'null') {
      app.getElementById('ProcessAll').setEnabled(false);
      app.getElementById('ProcessSelected').setEnabled(false);
      app.getElementById('SelectAndProcess').setEnabled(false);
      return app;
    }

    // Set description and help links, if available.
    if (typeof StudentMatrix.components.studentActions[component].description == 'string') {
      description.setText(StudentMatrix.components.studentActions[component].description);
    }
    if (typeof StudentMatrix.components.studentActions[component].helpLink == 'string') {
      helpLink.setHref(StudentMatrix.components.studentActions[component].helpLink).setHTML('Help page<br />');
    }

    // Run basic validator on the component, if available.
    if (typeof StudentMatrix.components.studentActions[component].validator == 'function') {
      if (StudentMatrix.components.studentActions[component].validator() != null) {
        errorMessage.setText('Cannot run action: ' + StudentMatrix.components.studentActions[component].validator());
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
  },

  // Allow selecting students before running any actions.
  studentSelectHandler : function(eventInfo) {
    toast('Reading students...');
    StudentMatrix.loadComponents('iterators');
    var app = UiApp.createApplication().setTitle('Select which students to process');
    var panel = app.createVerticalPanel().setHeight('100%');

    // Build a list of checkboxes, one for each student.
    var toggleHandler = StudentMatrix.addModuleHandler('studentActions', 'studentSelectToggle');
    var checkboxes = [];
    var processColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
    var nameColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'studentName');
    for (var row in this.studentRows('ProcessAll')) {
      var values = StudentMatrix.components.iterators.getRowValues(row);
      checkboxes[row] = app.createCheckBox(values[0][nameColumn - 1]).setValue(values[0][processColumn - 1] == 1).addClickHandler(toggleHandler).setId(row);
      panel.add(checkboxes[row]);
    }

    // Add a button for running the action. (It will actually call the options builder.)
    var buttonHandler = StudentMatrix.addModuleHandler('studentActions', 'optionsHandler');
    panel.add(app.createButton('Run action', buttonHandler).setId('ProcessSelected'));
    app.add(app.createScrollPanel(panel).setHeight('100%'));

    var selectedAction = app.createHidden('SelectedAction', eventInfo.parameter.SelectedAction);
    buttonHandler.addCallbackElement(selectedAction);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  // Handler for the student selection dialog. Toggles process flag or runs actions.
  studentSelectToggle : function(eventInfo) {
    var processColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
    var cell = StudentMatrix.mainSheet().getRange(eventInfo.parameter.source, processColumn);
    if (cell.getValue() == 1) {
      cell.setValue(0);
    }
    else {
      cell.setValue(1);
    }
  },

  // Displays any options for an action, before running it.
  optionsHandler : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    // Get the component to run and which mode to run in. Add as hidden elements.
    var component = eventInfo.parameter.SelectedAction;
    var mode = eventInfo.parameter.source;

    // Check for an options builder for the component. If found, display a form with options.
    StudentMatrix.loadComponents('studentActions');
    if (typeof StudentMatrix.components.studentActions[component].optionsBuilder == 'function') {
      app.setTitle('Set options for this action');
      // Options may overfill the normal popup, so we need a panel container.
      var wrapper = app.createScrollPanel().setWidth('100%').setHeight('100%').setAlwaysShowScrollBars(true);
      var panel = app.createVerticalPanel();
      wrapper.add(panel);
      // Create a handler and call the options builder to add any form elements.
      var handler = StudentMatrix.addModuleHandler('studentActions', 'optionsProcessor');
      StudentMatrix.components.studentActions[component].optionsBuilder(handler, panel);

      // Add the component and mode as hidden widgets, to pass on their information.
      var componentWidget = app.createHidden('component', component).setId('component');
      var modeWidget = app.createHidden('mode', mode).setId('mode');
      handler.addCallbackElement(componentWidget);
      handler.addCallbackElement(modeWidget);
      panel.add(componentWidget);
      panel.add(modeWidget);

      panel.add(app.createHTML('<hr />'));
      panel.add(app.createButton('Cancel', handler).setId('Cancel'));
      panel.add(app.createButton('OK', handler).setId('OK'));
      app.add(wrapper);
      SpreadsheetApp.getActiveSpreadsheet().show(app);
    }
    // If no options builder is found, just call the action execution method without any options.
    else {
      this.componentExecute(component, mode);
    }
  },

  // Handler for the componentOptionsDialog, allowing OK and Cancel.
  optionsProcessor : function(eventInfo) {
    // If it wasn't the OK button being clicked, close the dialog -- we're done.
    if (eventInfo.parameter.source != 'OK') {
      UiApp.getActiveApplication().close();
      return UiApp.getActiveApplication();
    }
    // If it was the OK button that was clicked: build options and call the action.
    else {
      StudentMatrix.loadComponents('studentActions');
      var app = UiApp.getActiveApplication();
      var component = eventInfo.parameter.component;
      var mode = eventInfo.parameter.mode;

      // If there is an optionsProcessor declared in the component, use it.
      if (typeof StudentMatrix.components.studentActions[component].optionsProcessor == 'function') {
        var options = StudentMatrix.components.studentActions[component].optionsProcessor(eventInfo);
      }
      // If no optionsProcessor was found, just look for values for the declared options.
      else {
        // Load default options from the action component, overwrite with options in eventInfo.
        var options = StudentMatrix.components.studentActions[component].options;
        for (var option in StudentMatrix.components.studentActions[component].options) {
          options[option] = eventInfo.parameter[option];
        }
      }

      // Execute the action with the given options, in the given mode.
      this.componentExecute(component, mode, options);
      return app;
    }
  },

  // Calls the actual action, once for each student that should be processed.
  componentExecute : function(component, mode, options) {
    // This process may be slow, so it makes sense to display a message while processing.
    StudentMatrix.toast('Running action...');
    UiApp.getActiveApplication().close();

    // Get the name of the iterator that should be used.
    StudentMatrix.loadComponents('iterators');
    var iterator = StudentMatrix.components.studentActions[component].iterator;
    var skipped = '';
    // Loop through all relevant students.
    for (var row in this.studentRows(mode)) {
      // Let the iterator build the object on which the action should act, then call the action.
      var item = StudentMatrix.components.iterators[iterator](row);
      if (item == false) {
        StudentMatrix.toast('Cannot process row ' + row + '.', 'Skipping student');
        skipped += ' ' + row;
      }
      else {
        StudentMatrix.components.studentActions[component].processor(item, options, row);
      }
    }

    if (skipped == '') {
      StudentMatrix.toast('All relevant students processed.', 'Actions completed.');
    }
    else {
      StudentMatrix.toast('Skipped students on these rows:' + skipped, 'Actions completed.');
    }
  },
};

// Declares an iterator used by the StudentActions module.
StudentMatrix.plugins.studentActions = {
  // One iterator used by core, for selecting students.
  iterators : {
    getRowValues : function(row) {
      return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn() - 1).getValues()[0];
    },
  },
};
