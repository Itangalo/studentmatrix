//StudentMatrix.settings.matrixtemplate = {
//  name : 'Student matrix template',
//  group : 'Spreadsheet',
//  description : 'The spreadsheet used as a template when creating student matrices.',
//  formBuilder : function(container) {
//    var app = UiApp.getActiveApplication();
//
//    container.add(app.createHTML('Matrix template ' + StudentMatrix.getProperty('settings', 'matrixtemplate')));
//
//    var subHandler = app.createServerHandler('matrixtemplateFilePicker');
//    container.add(app.createButton('Select file', subHandler));
//    
//    var matrixtemplate = app.createTextBox().setId('matrixtemplate').setName('matrixtemplate');
//    container.add(matrixtemplate);
////    handler.addCallbackElement(matrixtemplate);
//  },
//  processor : function(eventInfo) {
//    debug('I am, too.');
//  },
//};
//
//StudentMatrix.settings.matrixtemplate2 = {
//  name : 'Student matrix template 2',
//  group : 'Spreadsheet',
//  description : 'The spreadsheet used as a template when creating student matrices.',
//  formBuilder : function(container) {
//    var app = UiApp.getActiveApplication();
////    var panel = app.getElementById('settingsPanel');
//
//    container.add(app.createHTML('Some other settings...'));
//
//    var subHandler = app.createServerHandler('matrixtemplateFilePicker');
//    container.add(app.createButton('Select file', subHandler));
//    
//    var matrixtemplate = app.createTextBox().setId('matrixtemplate').setName('matrixtemplate');
//    container.add(matrixtemplate);
////    handler.addCallbackElement(matrixtemplate);
//    return app;
//  },
//  processor : function(eventInfo) {
//    debug('I am, too.');
//  },
//};
//
//function matrixtemplateFilePicker(eventInfo) {
//  var app = UiApp.getActiveApplication();
//  var handler = app.createServerHandler('matrixtemplateFilePickerSelect');
//  app.createDocsListDialog().setDialogTitle('Select file').setInitialView(UiApp.FileType.SPREADSHEETS).showDocsPicker().addSelectionHandler(handler);
//  return app;
//}
//
//function matrixtemplateFilePickerSelect(eventInfo) {
//  var app = UiApp.getActiveApplication();
//  app.getElementById('matrixtemplate').setText(eventInfo.parameter.items[0].id);
//  return app;
//}
