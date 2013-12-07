/**
 * @file
 * Module that allows actions to be run on all or selected students.
 * Introduces the 'studentActions' and 'iterators' components.
 */
function actionsDialog() {
  StudentMatrix.modules.studentActions.actionsDialog();
};

StudentMatrix.modules.studentActions = {
  // Declares all menu entries for this module.
  menuEntries : {
    actionsDialog : 'Run actions on students',
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
    StudentMatrix.loadComponents('iterators');
    
    var app = UiApp.createApplication().setTitle('Run actions on students');
    var descriptionHandler = StudentMatrix.addModuleHandler('studentActions', 'showDescriptions');

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

    var buttonsHandler = StudentMatrix.addModuleHandler('studentActions', 'actionsDialogHandler');
    buttonsHandler.addCallbackElement(actionsList);
    
    app.add(app.createLabel('', true).setId('ActionDescription'));
    app.add(app.createAnchor('', false, '').setId('ActionHelpLink'));
    
    app.add(app.createButton('Run for all students', buttonsHandler).setId('ProcessAll').setEnabled(false));
    app.add(app.createButton('Run for selected students (' + this.studentRows('count') + ')', buttonsHandler).setId('ProcessSelected').setEnabled(false));
    app.add(app.createButton('Select students and run', buttonsHandler).setId('SelectAndProcess').setEnabled(false));
    
    app.add(app.createLabel('', true).setId('ErrorMessage'));
    
    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },

  // Returns an array with row numbers of all students that should be processed, or the number of selected students.
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
  
  // Handler for the actions dialog. Calls actions when klicking on buttons.
  actionsDialogHandler : function(eventInfo) {
    // Call the relevant processor
    if (eventInfo.parameter.source == 'ProcessAll' || eventInfo.parameter.source == 'ProcessSelected') {
      var app = UiApp.getActiveApplication();
      var component = eventInfo.parameter.SelectedAction;
      this.componentOptionsDialog(component, eventInfo.parameter.source, app);
      return app;
    }
    if (eventInfo.parameter.source == 'SelectAndProcess') {
      this.selectStudents(eventInfo);
      return UiApp.getActiveApplication();
    }
  },
  
  // Handler displaying a dialog for selecting students to process.
  selectStudents : function(eventInfo) {
    toast('Reading students...');
    StudentMatrix.loadComponents('iterators');
    var app = UiApp.createApplication().setTitle('Select which students to process');
    var panel = app.createVerticalPanel().setHeight('100%');
    
    var checkboxes = [];
    var handler = StudentMatrix.addModuleHandler('studentActions', 'studentDialogHandler');
    var processColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'process');
    var nameColumn = StudentMatrix.getProperty('StudentMatrixColumns', 'studentName');
    
    for (var row in this.studentRows('ProcessAll')) {
      var values = StudentMatrix.components.iterators.getRowValues(row);
      checkboxes[row] = app.createCheckBox(values[0][nameColumn - 1]).setValue(values[0][processColumn - 1] == 1).addClickHandler(handler).setId(row).setName(2);
      panel.add(checkboxes[row]);
    }
    
    panel.add(app.createButton('Run action', handler).setId('RunAction'));
    app.add(app.createScrollPanel(panel).setHeight('100%'));
    
    var hidden = app.createHidden('SelectedAction', eventInfo.parameter.SelectedAction);
    handler.addCallbackElement(hidden);
    
    SpreadsheetApp.getActiveSpreadsheet().show(app);
    return app;
  },
  
  // Handler for the student selection dialog. Toggles process flag or runs actions.
  studentDialogHandler : function(eventInfo) {
    // If the 'Run action' button was hit, call the relevant processor.
    if (eventInfo.parameter.source == 'RunAction') {
      var app = UiApp.getActiveApplication();
      var component = eventInfo.parameter.SelectedAction;
      this.componentOptionsDialog(component, 'ProcessSelected', app);
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
  },

  // Calls the processors in studentActions components, to run actions on student rows.
  componentOptionsDialog : function(component, mode, app) {
    StudentMatrix.loadComponents('studentActions');
    // Check for an options builder for the component. If found, display a form with options.
    if (typeof StudentMatrix.components.studentActions[component].optionsBuilder == 'function') {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addModuleHandler('studentActions', 'componentOptionsDialogHandler');

      StudentMatrix.components.studentActions[component].optionsBuilder(handler);
      app.add(app.createButton('Cancel', handler).setId('Cancel'));
      app.add(app.createButton('OK', handler).setId('OK'));
      var componentWidget = app.createHidden('component', component).setId('component');
      var componentMode = app.createHidden('mode', mode).setId('mode');
      handler.addCallbackElement(componentWidget);
      handler.addCallbackElement(componentMode);
      app.add(componentWidget);
      app.add(componentMode);
      SpreadsheetApp.getActiveSpreadsheet().show(app);
    }
    else {
      this.componentExecute(component, mode);
    }
  },
  
  // Handler for the componentOptionsDialog, allowing OK and Cancel.
  componentOptionsDialogHandler : function(eventInfo) {
    if (eventInfo.parameter.source == 'OK') {
      StudentMatrix.loadComponents('studentActions');
      var app = UiApp.getActiveApplication();
      var component = eventInfo.parameter.component;
      var options = {};
      if (typeof StudentMatrix.components.studentActions[component].options == 'object') {
        for (var option in StudentMatrix.components.studentActions[component].options) {
          options[option] = eventInfo.parameter[option];
        }
      }
      this.componentExecute(eventInfo.parameter.component, eventInfo.parameter.mode, options);
      return app;
    }
  },
  
  componentExecute : function(component, mode, options) {
    toast('running...');
    StudentMatrix.loadComponents('iterators');

    var iterator = StudentMatrix.components.studentActions[component].iterator;
    for (var row in this.studentRows(mode)) {
      var object = StudentMatrix.components.iterators[iterator](row);
      StudentMatrix.components.studentActions[component].processor(object, options);
    }
    
    UiApp.getActiveApplication().close();
  },
};

StudentMatrix.plugins.studenActions = {
  // One iterator used by core, for selecting students.
  iterators : {
    getRowValues : function(row) {
      return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn() - 1).getValues();
    },
  },
};
