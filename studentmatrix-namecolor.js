StudentMatrix.plugins.namecolor = {
  studentActions : {
    namecolor : {
      name : 'Set background color for name',
      group : 'Examples',
      iterator : 'studentName',
      description : 'This is an example action. It allows you to change the background color for the student names in the list.',
      processor : function(object, options) {
        object.setBackground(options.color);
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
        
        var subHandler = StudentMatrix.addPluginHandler('namecolor', 'showPicker');
        app.add(app.createButton('show picker', subHandler));
        
        var fileId = app.createTextBox().setId('fileID').setName('fileID');
        app.add(fileId);
        handler.addCallbackElement(fileId);
      },
    },
  },
  handlers : {
    showPicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('namecolor', 'closePicker');
      app.createDocsListDialog().setDialogTitle('Select file').showDocsPicker().addSelectionHandler(handler);
      return app;
    },
    closePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('fileID').setText(eventInfo.parameter.items[0].id);
      return app;
    },
  },
};
