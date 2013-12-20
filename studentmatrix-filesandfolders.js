/**
* @file
* StudentActions managing files and folders for students.
*/

StudentMatrix.modules.filesandfolders = {
  columns : {
    studentFolderPrivate : 'ID for folder private to teacher',
    studentFolderViewable : 'ID for folder viewable by student',
    studentFolderEditable : 'ID for folder editable by student',
  },
};

StudentMatrix.plugins.filesandfolders = {
  studentActions : {
    createFolder : {
      name : 'Create folders for each student',
      group : 'Files and folders',
      description : 'Creates a folder for each student. Folders may be private to the teacher, viewable by the student, or editable by the student.',
      
      processor : function(row, options) {
        var studentFolderPrivateCell = StudentMatrix.components.fetchers.studentColumnCell(row, 'studentFolderPrivate');
        var studentFolderViewableCell = StudentMatrix.components.fetchers.studentColumnCell(row, 'studentFolderViewable');
        var studentFolderEditableCell = StudentMatrix.components.fetchers.studentColumnCell(row, 'studentFolderEditable');
        var studentMail = StudentMatrix.components.fetchers.studentColumnValue(row, 'studentMail');

        // Create and/or rename the private folder.
        if (options.privateCreate == 'true' && studentFolderPrivateCell.getValue() == '') {
          var studentFolderPrivate = DocsList.createFolder(StudentMatrix.replaceColumnTokens(options.privateName, row));
          studentFolderPrivateCell.setFormula('=hyperlink("' + studentFolderPrivate.getUrl() + '";"' + studentFolderPrivate.getId() + '")');
        }
        else if (studentFolderPrivateCell.getValue() != '') {
          var studentFolderPrivate = DocsList.getFolderById(studentFolderPrivateCell.getValue());
          if (options.privateName != '') {
            studentFolderPrivate.rename(StudentMatrix.replaceColumnTokens(options.privateName, row))
          }
        }
        else {
          var studentFolderPrivate = false;
        }

        // Create and/or rename the viewable folder.
        if (options.viewableCreate == 'true' && studentFolderViewableCell.getValue() == '') {
          var studentFolderViewable = DocsList.createFolder(StudentMatrix.replaceColumnTokens(options.viewableName, row));
          studentFolderViewableCell.setFormula('=hyperlink("' + studentFolderViewable.getUrl() + '";"' + studentFolderViewable.getId() + '")');
          studentFolderViewable.addViewer(studentMail);
        }
        else if (studentFolderViewableCell.getValue() != '') {
          var studentFolderViewable = DocsList.getFolderById(studentFolderViewableCell.getValue());
          studentFolderViewable.addViewer(studentMail);
          if (options.viewableName != '') {
            studentFolderViewable.rename(StudentMatrix.replaceColumnTokens(options.viewableName, row))
          }
        }
        else {
          var studentFolderViewable = false;
        }
        
        // Create and/or rename the editable folder.
        if (options.editableCreate == 'true' && studentFolderEditableCell.getValue() == '') {
          var studentFolderEditable = DocsList.createFolder(StudentMatrix.replaceColumnTokens(options.editableName, row));
          studentFolderEditableCell.setFormula('=hyperlink("' + studentFolderEditable.getUrl() + '";"' + studentFolderEditable.getId() + '")');
          studentFolderEditable.addEditor(studentMail);
        }
        else if (studentFolderEditableCell.getValue() != '') {
          var studentFolderEditable = DocsList.getFolderById(studentFolderEditableCell.getValue());
          studentFolderEditable.addEditor(studentMail);
          if (options.editableName != '') {
            studentFolderEditable.rename(StudentMatrix.replaceColumnTokens(options.editableName, row))
          }
        }
        else {
          var studentFolderEditable = false;
        }
        
        // Add access permissions and parent folders according to the settings.
        if (typeof options.parentFolder == 'string') {
          var parentFolder = DocsList.getFolderById(options.parentFolder);
        }
        else {

          parentFolder = false;
        }
        
        // First: the private folder
        if (studentFolderPrivate != false) {
          if (StudentMatrix.getProperty('teacherEmails') != '') {
            studentFolderPrivate.addEditors(StudentMatrix.getProperty('teacherEmails').split("\n"));
          }
          if (parentFolder != false) {
            studentFolderPrivate.addToFolder(parentFolder);
            studentFolderPrivate.removeFromFolder(DocsList.getRootFolder());
          }
        }
        
        // Second: the viewable folder
        if (studentFolderViewable != false) {
          if (StudentMatrix.getProperty('teacherEmails') != '') {
            studentFolderViewable.addEditors(StudentMatrix.getProperty('teacherEmails').split("\n"));
          }
          studentFolderViewable.addViewer(studentMail);
          if (options.placeInPrivate == 'true' && studentFolderPrivate != false) {
            studentFolderViewable.addToFolder(studentFolderPrivate);
            studentFolderViewable.removeFromFolder(DocsList.getRootFolder());
          }
          if (parentFolder != false && options.placeInPrivate == 'false') {
            studentFolderViewable.addToFolder(parentFolder);
            studentFolderViewable.removeFromFolder(DocsList.getRootFolder());
          }
        }

        // Third: the editable folder
        if (studentFolderEditable != false) {
          if (StudentMatrix.getProperty('teacherEmails') != '') {
            studentFolderEditable.addEditors(StudentMatrix.getProperty('teacherEmails').split("\n"));
          }
          studentFolderEditable.addEditor(studentMail);
          if (options.placeInPrivate == 'true' && studentFolderPrivate != false) {
            studentFolderEditable.addToFolder(studentFolderPrivate);
            studentFolderEditable.removeFromFolder(DocsList.getRootFolder());
          }
          if (parentFolder != false && options.placeInPrivate == 'false') {
            studentFolderEditable.addToFolder(parentFolder);
            studentFolderEditable.removeFromFolder(DocsList.getRootFolder());
          }
        }
      },
      validator : function() {
      },
      
      options : {
        privateCreate : true,
        privateName : '',
        viewableCreate : true,
        viewableName : '',
        editableCreate : true,
        editableName : '',
        parentFolder : true,
        placeInPrivate : true,
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        var privateCreate = app.createCheckBox('Create a folder which only teachers may access.').setName('privateCreate');
        container.add(privateCreate);
        handler.addCallbackElement(privateCreate);
        
        container.add(app.createLabel('Name for private folders. You may use replacement tokens like "[column-2]". (If private folders already exist, they will be renamed.)'));
        var privateName = app.createTextBox().setName('privateName').setWidth('100%').setText('[column-2] (teachers only)');
        container.add(privateName);
        handler.addCallbackElement(privateName);
        
        var app = UiApp.getActiveApplication();
        var viewableCreate = app.createCheckBox('Create a folder which the student can view.').setName('viewableCreate');
        container.add(viewableCreate);
        handler.addCallbackElement(viewableCreate);
        
        container.add(app.createLabel('Name for viewable folders. You may use replacement tokens like "[column-2]". (If viewable folders already exist, they will be renamed.)'));
        var viewableName = app.createTextBox().setName('viewableName').setWidth('100%').setText('[column-2] (viewable)');
        container.add(viewableName);
        handler.addCallbackElement(viewableName);
        
        var app = UiApp.getActiveApplication();
        var editableCreate = app.createCheckBox('Create a folder where the student may edit files and content.').setName('editableCreate');
        container.add(editableCreate);
        handler.addCallbackElement(editableCreate);
        
        container.add(app.createLabel('Name for editable folders. You may use replacement tokens like "[column-2]". (If editable folders already exist, they will be renamed.)'));
        var editableName = app.createTextBox().setName('editableName').setWidth('100%').setText('[column-2] (editable)');
        container.add(editableName);
        handler.addCallbackElement(editableName);
        
        var parentFolderHandler = StudentMatrix.addPluginHandler('filesandfolders', 'parentFolderHandler');
        var parentFolderButton = app.createButton('Set parent folder for the student folders', parentFolderHandler)
        container.add(parentFolderButton);
        var parentFolder = app.createTextBox().setName('parentFolder').setId('parentFolder');
        container.add(parentFolder);
        handler.addCallbackElement(parentFolder);
        
        var placeInPrivate = app.createCheckBox('Use private folder as parent folder for viewable and editable folder. (Overrides previous parent folder setting.)').setName('placeInPrivate');
        container.add(placeInPrivate);
        handler.addCallbackElement(placeInPrivate);
      },
    },
  },
  
  handlers : {
    parentFolderHandler : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('filesandfolders', 'parentFolderHandlerClose');
      app.createDocsListDialog().setDialogTitle('Select parent folder').setInitialView(UiApp.FileType.FOLDERS).addSelectionHandler(handler).showDocsPicker();
      return app;
    },
    parentFolderHandlerClose : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('parentFolder').setText(eventInfo.parameter.items[0].id);
      return app;
    },
  },
};
