StudentMatrix.addComponent('studentActions', 'spreadsheet', {
  name : 'Create student sheets',
  group : 'Spreadsheet',
  iterator : 'studentRow',
  description : 'This is an example action. It allows you to change the background color for the student names in the list.',
  processor : function(object, options) {
    debug(options, 'index');
//    object.setBackground(StudentMatrix.options.namecolor);
  },
  settings : {
    spreadsheetTemplate : '',
  },
  settingsBuilder : function(handler) {
    var app = UiApp.getActiveApplication();

    app.add(app.createHTML('Matrix template ' + StudentMatrix.getParameter('spreadsheetTemplate')));
    
    var subHandler = app.createServerHandler('spreadsheetFilePicker');
    app.add(app.createButton('Select file', subHandler));
    
    var spreadsheetTemplate = app.createTextBox().setId('spreadsheetTemplate').setName('spreadsheetTemplate');
    app.add(spreadsheetTemplate);
    handler.addCallbackElement(spreadsheetTemplate);
  },
});

/**
 * Returns the entire row for a student, from the student list.
 */
StudentMatrix.iterators.studentRow = function(row) {
  return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn());
}

function spreadsheetFilePicker(eventInfo) {
  var app = UiApp.getActiveApplication();
  var handler = app.createServerHandler('spreadsheetFilePickerSelect');
  app.createDocsListDialog().setDialogTitle('Select file').showDocsPicker().addSelectionHandler(handler);
  return app;
}

function spreadsheetFilePickerSelect(eventInfo) {
  var app = UiApp.getActiveApplication();
  app.getElementById('spreadsheetTemplate').setText(eventInfo.parameter.items[0].id);
  return app;
}
