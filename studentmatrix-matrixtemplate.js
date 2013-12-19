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
    // Stub setting. @TODO: This setting should allow to view and change the mappings for push sheets.
    setPushSheets : {
      group : 'Push sheets',
      options : {
      },
      optionsBuilder : function(handler, container, defaults) {
        var app = UiApp.getActiveApplication();
        var mappings = StudentMatrix.getProperty('StudentMatrixPushMapping');
        var template = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
        for (var i in SpreadsheetApp.getActiveSpreadsheet().getSheets()) {
          container.add(app.createLabel(SpreadsheetApp.getActiveSpreadsheet().getSheets()[i].getName() + ': '));
          var sourceID = SpreadsheetApp.getActiveSpreadsheet().getSheets()[i].getSheetId();
          var targetID = mappings[sourceID];
          if (targetID != undefined) {
            container.add(app.createHTML(StudentMatrix.plugins.matrixtemplate.getSheetByID(template, targetID).getName()));
          }
          else {
            container.add(app.createHTML('(no tab connected)'));
          }
        }
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
        var studentEmail = StudentMatrix.components.fetchers.studentColumnValue(row, 'studentMail');
        var fileName = StudentMatrix.replaceColumnTokens(options.fileName, row);
        var folderID = StudentMatrix.components.fetchers.studentColumnValue(row, 'studentFolderID');

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
        
        // Note that this final part of the checks changes the copy.
        if (options.moveToFolder == 'true' && folderID != false) {
          var folder = DocsList.getFolderById(folderID);
          copy = DocsList.getFileById(copy.getId());
          copy.addToFolder(folder);
          copy.removeFromFolder(DocsList.getRootFolder());
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
    studentSpreadsheet : function(row) {
      var fileID = StudentMatrix.components.fetchers.studentColumnValue(row, 'studentSheetID');
      if (fileID == false) {
        return false;
      }
      return SpreadsheetApp.openById(fileID);
    },
    studentRange : function(row, sheetName, a1Notation) {
      var sheet = StudentMatrix.components.fetchers.studentSpreadsheet(row);
      if (sheet == false) {
        return false;
      }
      return sheet.getSheetByName(sheetName).getRange(a1Notation);
    },
  },
  
  globalActions : {
    addPushSheet : {
      name : 'Add a sheet to push updates to student sheets',
      group : 'Update student sheets',
      description : 'Adds a "push sheet", used to make changes that will be pushed to selected student sheets. If your student sheets have more than one tab, the push sheet will update the same tab as it was created from.',
      
      validator : function() {
        try {
          SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
        }
        catch(e) {
          return 'Could not open the matrix template. Please make sure one is set in the settings.';
        }
      },
      
      options : {
        tabID : false,
        newName : 'new push sheet',
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        var template = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
        container.add(app.createLabel('Which tab to you want to use to create a push sheet?'));
        var tabID = app.createListBox().setName('tabID');
        handler.addCallbackElement(tabID);
        
        for (var tab in template.getSheets()) {
          tabID.addItem(template.getSheets()[tab].getSheetName(), template.getSheets()[tab].getSheetId());
        }
        container.add(tabID);

        container.add(app.createLabel('What should the tab be called here in the master sheet?'));
        var newName = app.createTextBox().setName('newName').setWidth('100%').setText('new push sheet');
        handler.addCallbackElement(newName);
        container.add(newName);
        
        return app;
      },
      
      processor : function(options) {
        var template = SpreadsheetApp.openById(StudentMatrix.getProperty('templateID'));
        var sheet = StudentMatrix.plugins.matrixtemplate.getSheetByID(template, options.tabID);
        sheet.copyTo(SpreadsheetApp.getActiveSpreadsheet()).activate().setName(options.newName);
        var copy = SpreadsheetApp.getActiveSpreadsheet();
        copy.moveActiveSheet(2);
        StudentMatrix.setProperty(options.tabID, 'StudentMatrixPushMapping', copy.getSheetId().toString());
      },
    },
  },
  
  handlers : {
    showFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('matrixtemplate', 'closeFilePicker');
      app.createDocsListDialog().setDialogTitle('Select spreadsheet to use as matrix template').setInitialView(UiApp.FileType.SPREADSHEETS).addSelectionHandler(handler).showDocsPicker();
      return app;
    },
    closeFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('templateID').setText(eventInfo.parameter.items[0].id);
      return app;
    },
  },
  
  // Helper function to get a sheet by ID, from a spreadsheet.
  getSheetByID : function(spreadsheet, sheetID) {
    // This is a rather silly way of loading a sheet by ID, but I found no better.
    for (var i in spreadsheet.getSheets()) {
      if (spreadsheet.getSheets()[i].getSheetId() == sheetID) {
        return spreadsheet.getSheets()[i];
      }
    }
  },
};
