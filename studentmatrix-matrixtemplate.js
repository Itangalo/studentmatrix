/**
 * @file
 * Allows copying a matrix template file to students, and setting access to the
 * copies.
 */

StudentMatrix.modules.matrixtemplate = {
  columns : {
    // Column used for ID and link to student sheets.
    studentSheetID : 'Student sheet ID',
    studentFolderID : 'Student folder ID',
  },
};

StudentMatrix.plugins.matrixtemplate = {
  settings : {
    matrixtemplate : {
      group : 'Student sheet setup',
      options : {
        templateID : '',
        teacherEmails : '',
      },
      optionsBuilder : function(handler, container, defaults) {
        var app = UiApp.getActiveApplication();
        try {
          var template = SpreadsheetApp.openById(defaults.templateID);
          container.add(app.createHTML('File used for matrix template: '));
          container.add(app.createAnchor(template.getName(), template.getUrl()));
        }
        catch(e) {
          container.add(app.createHTML('No template selected. Please use button below to select one.'));
        }
        var textBox = app.createTextBox().setName('templateID').setId('templateID').setText(defaults.templateID);
        container.add(textBox);
        handler.addCallbackElement(textBox);
        
        var fileHandler = StudentMatrix.addPluginHandler('matrixtemplate', 'showFilePicker');
        container.add(app.createButton('Select template file', fileHandler));
        
        container.add(app.createHTML('Emails for teachers, which should have edit access to all student sheets. (One per line.)'));
        
        var teacherEmails = app.createTextArea().setName('teacherEmails').setWidth('100%').setText(defaults.teacherEmails);
        container.add(teacherEmails);
        handler.addCallbackElement(teacherEmails);
      },
    },
  },
  
  studentActions : {
    copySheet : {
      name : 'Create student sheets from matrix template',
      group : 'Student sheet setup',
      description : 'Makes a copy of the matrix template for each student.',

      processor : function(item, options) {
        if (item.getValue() == '') {
          var copy = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID')).copy('Test copy (delete)');
          item.setFormula('=hyperlink("' + copy.getUrl() + '";"' + copy.getId() + '")');
        }
      },
      
      iterator : 'matrixFileCell',

      validator : function() {
        if (StudentMatrix.getProperty('StudentMatrixColumns', 'studentSheetID') == undefined) {
          return 'You must set up the columns used for student sheets before running this action. Visit the global actions to do this.';
        }
        if (StudentMatrix.getProperty('templateID') == undefined) {
          return 'You must set a matrix template in the settings before running this action.';
        }
        try {
          var template = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
        }
        catch(e) {
          return 'The matrix template could not be loaded. Please verify that it is set correctly in the global settings.';
        }
      },
      
    },
  },
  
  iterators : {
    matrixFileCell : function(row) {
      return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentSheetID'));
    },
  },
  
  handlers : {
    showFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('matrixtemplate', 'closeFilePicker');
      app.createDocsListDialog().setDialogTitle('Select to use as matrix template').setInitialView(UiApp.FileType.SPREADSHEETS).addSelectionHandler(handler).showDocsPicker();
      return app;
    },
    closeFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('templateID').setText(eventInfo.parameter.items[0].id);
      return app;
    },
  },
};
