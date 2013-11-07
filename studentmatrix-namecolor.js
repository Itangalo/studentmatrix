StudentMatrix.plugins.namecolor = {
  name : 'Set background color for name',
  group : 'Examples',
  iterator : 'studentName',
  description : 'This is an example action. It allows you to change the background color for the student names in the list.',
  processor : function(object, options) {
    debug(options, 'index');
//    object.setBackground(StudentMatrix.options.namecolor);
  },
  options : {
    fileID : '',
    color : 'blue',
  },
  optionsBuilder : function(handler) {
    var app = UiApp.getActiveApplication();

    app.add(app.createHTML('Background color'));
    var color = app.createTextBox().setId('color').setName('color');
    app.add(color);
    handler.addCallbackElement(color);
    
    var subHandler = app.createServerHandler('namecolorHandlerShow');
    app.add(app.createButton('show picker', subHandler));
    
    var fileId = app.createTextBox().setId('fileID').setName('fileID');
    app.add(fileId);
    handler.addCallbackElement(fileId);
  },
};

function namecolorHandlerShow(eventInfo) {
  var app = UiApp.getActiveApplication();
//  var app = UiApp.createApplication();
  var handler = app.createServerHandler('namecolorHandler');
  app.createDocsListDialog().setDialogTitle('Select file').showDocsPicker().addSelectionHandler(handler);
  return app;
}

function namecolorHandler(eventInfo) {
//  debug(eventInfo.parameter.items[0].id);
  var app = UiApp.getActiveApplication();
  app.getElementById('fileID').setText(eventInfo.parameter.items[0].id);
//  app.add(app.createHidden('file', eventInfo.parameter.items[0].id));
//  debug(eventInfo.parameter.items[0], 'index');
  return app;
}
