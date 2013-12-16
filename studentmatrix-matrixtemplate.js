/**
 * @file
 * Allows copying a matrix template file to students, and setting access to the
 * copies.
 */

StudentMatrix.modules.matrixtemplate = {
  columns : {
    // Column used for ID and link to student sheets.
    studentSheetID : 'Student sheet ID',
    studentSheetUrl : 'Student sheet url',
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
      description : 'Makes a copy of the matrix template for each student. Can also be used for changing access settings to existing student sheets.',

      processor : function(row, options) {
        // Fetch the relevant data for this row.
        var matrixFileCell = StudentMatrix.components.fetchers.studentColumnCell(row, 'studentSheetID');
        var matrixUrlCell = StudentMatrix.components.fetchers.studentColumnCell(row, 'studentSheetUrl');
        var studentEmail = StudentMatrix.components.fetchers.studentEmailValue(row);
        var fileName = StudentMatrix.replaceColumnTokens(options.fileName, row);

        // Create the student sheet if it doesn't already exist. In any case, load it into the varible 'copy'.
        if (matrixFileCell.getValue() == '') {
          var copy = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID')).copy(fileName);
          var newlyCreated = true;
          matrixFileCell.setFormula('=hyperlink("' + copy.getUrl() + '";"' + copy.getId() + '")');
        }
        else {
          var copy = SpreadsheetApp.openById(matrixFileCell.getValue());
          var newlyCreated = false;
        }
        
        if (matrixUrlCell.getValue() == '') {
          matrixUrlCell.setValue(copy.getUrl());
        }
        
        // Go through the options to set permissions (and some other things), one at a time.
        if (options.rewriteNames == 'true' && newlyCreated == false) {
          copy.rename(fileName);
        }
        
        if (options.resetPermissions == 'true') {
          copy.setAnonymousAccess(false, false);
          var editors = copy.getEditors();
          for (var editor in editors) {
            if (editors[editor] != '') {
              copy.removeEditor(editors[editor]);
            }
          }
          var viewers = copy.getViewers();
          for (var viewer in viewers) {
            if (viewers[viewer] != '') {
              copy.removeViewer(viewers[viewer]);
            }
          }
        }
        
        if (options.addTeachers == 'true') {
          if (StudentMatrix.getProperty('teacherEmails') != '') {
            copy.addEditors(StudentMatrix.getProperty('teacherEmails').split("\n"));
          }
        }
        
        if (options.addStudentView == 'true') {
          copy.addViewer(studentEmail);
        }
        if (options.addStudentEdit == 'true') {
          copy.addEditor(studentEmail);
        }
        
        if (options.addAllView == 'true') {
          copy.setAnonymousAccess(true, false);
        }
      },
      
      options : {
        fileName : 'Student sheet for [column-2]',
        rewriteNames : false,
        resetPermissions : false,
        addTeachers : true,
        addStudentView : true,
        addStudentEdit : false,
        addAllView : false,
        moveToFolder : true,
      },
      // This is just a helper, to reduce code repeat.
      descriptions : {
        rewriteNames : 'Also rewrite the names of existing student sheets (if any).',
        resetPermissions : 'Remove all permissions on existing student sheets, then set new permissions.',
        addTeachers : 'Add edit permissions to all accounts specified in the teacher emails box in the settings.',
        addStudentView : 'Add student view permission to the student sheet.',
        addStudentEdit : 'Add student edit permission to the student sheet.',
        addAllView : 'Make the student sheet public, so that anyone can view it.',
        moveToFolder : 'Move the student sheet to any folder specified in the "student folder ID" column.',
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createLabel('Name for new student sheets:'));
        var fileName = app.createTextBox().setName('fileName').setWidth('100%').setText('Student sheet for [column-2]');
        container.add(fileName);
        handler.addCallbackElement(fileName);
        container.add(app.createLabel('(Tokens like "[column-2]" will be replaced with values in student rows.)'));
        container.add(app.createHTML('<br />'))
        
        var checkboxes = {};
        for (var checkbox in this.descriptions) {
          checkboxes[checkbox] = app.createCheckBox(this.descriptions[checkbox]).setName(checkbox).setValue(this.options[checkbox]);
          container.add(checkboxes[checkbox]).add(app.createHTML('<br />'));
          handler.addCallbackElement(checkboxes[checkbox]);
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
  
  fetchers : {
    matrixFileCell : function(row) {
      return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentSheetID'));
    },
    studentEmailValue : function(row) {
      return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentMail')).getValue();
    },
    studentRowValues : function(row) {
      return StudentMatrix.mainSheet().getRange(row, 1, 1, StudentMatrix.mainSheet().getLastColumn()).getValues();
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
