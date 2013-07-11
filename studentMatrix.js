// Written by Johan Falk, Sweden.
// Published under GNU General Public License, version 3 (GPL-3.0)
// See restrictions at http://www.opensource.org/licenses/gpl-3.0.html

function studentMatrixVersion() {
  return "2.3";
}

// Some global variables
var STUDENT_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students");
var FIRST_STUDENT_ROW = 2;
var LAST_STUDENT_ROW = STUDENT_SHEET.getLastRow();
var NUMBER_OF_STUDENTS = LAST_STUDENT_ROW - FIRST_STUDENT_ROW + 1;

/**
 * Display help link and version information.
 */
function studentMatrixHelp() {
  var app = UiApp.createApplication().setTitle("StudentMatrix (" + studentMatrixVersion() + ")");
  app.add(app.createLabel('StudentMatrix is a set of scripts for Google Drive that helps teachers manage assessment matrices.'));
  app.add(app.createLabel('See https://github.com/Itangalo/studentmatrix for project information and documentation. Some Swedish video guides can be found at http://tinyurl.com/studentmatrix-videor.'));
  app.add(app.createLabel('The source code for these scripts can be found on the project page. It is free to use, study, share and improve under standard GPL license.'));
  app.add(app.createLabel('Feel free to send feedback to johan@vaxjonexus.com or post an issue on the project page.'));

  SpreadsheetApp.getActiveSpreadsheet().show(app);
}

/**
 * Builds the menu when installing the script.
 */
function onInstall() {
  buildMenu();
}

/**
 * Builds the menu when opening the spreadsheet.
 */
function onOpen() {
  buildMenu();
}

/**
 * Adds a custom menu to the active spreadsheet on opening the spreadsheet.
 */
function buildMenu(parameters) {
  if (typeof parameters == 'undefined') {
    parameters = [];
  }

  var globalMenuEntries = [];
  if (sheetExists("students")) {
    globalMenuEntries.push({name : "Send email to students", functionName : "studentMatrixNotify"});
    globalMenuEntries.push({name : "Create new email template", functionName : "studentMatrixCreateMailTemplate"});
  }

  globalMenuEntries.push(null); // line separator
  if (studentMatrixGetConfig("version") != studentMatrixVersion()) {
    globalMenuEntries.push({name : "Setup: Rewrite sheet with student list", functionName : "studentMatrixCreateStudentList"});
  }
  if (studentMatrixGetConfig("spreadsheetTemplate") == "") {
    globalMenuEntries.push({name : "Setup: Create template sheet", functionName : "studentMatrixCreateTemplateSheet"});
  }
  else {
    globalMenuEntries.push({name : "Setup: Create student sheets", functionName : "studentMatrixCreateStudentSheets"});
    globalMenuEntries.push(null); // line separator
  }

  globalMenuEntries.push({name : "Help", functionName : "studentMatrixHelp"});
  globalMenuEntries.push({name : "Settings", functionName : "studentMatrixSettings"});

  // Only add these entries if there is a sheet called "Khan exercises".
  if (sheetExists("Khan exercises")) {
    globalMenuEntries.push(null); // line separator
    globalMenuEntries.push({name : "Khan Academy: Read and update exercises", functionName : "khanUpdate"});
    if (sheetExists("Khan goals")) {
      globalMenuEntries.push({name : "Khan Academy: Read and update goals", functionName : "khanGoals"});
    }
  }

  var studentOperationsMenuEntries = [];
  if (sheetExists("students")) {
    if (typeof parameters['selected students'] == 'undefined') {
      studentOperationsMenuEntries.push({name : 'Select students', functionName : 'studentMatrixStudents'});
    }
    else {
      studentOperationsMenuEntries.push({name : 'Select students (selected: ' + parameters['selected students'] + ')', functionName : "studentMatrixStudents"});
    }
    studentOperationsMenuEntries.push(null); // line separator
    studentOperationsMenuEntries.push({name : "Unlock selected cells (colored only)", functionName : "studentMatrixUnlock"});
    studentOperationsMenuEntries.push({name : "Degrade selected cells to review status (colored only)", functionName : "studentMatrixReview"});
    studentOperationsMenuEntries.push({name : "Mark selected cells ok (colored only)", functionName : "studentMatrixOk"});
// This option isn't used anymore. It was only used for manual Khan Academy updates.
//    studentOperationsMenuEntries.push({name : "Mark cells ok, unless marked for review", functionName : "studentMatrixSoftOk"});
    studentOperationsMenuEntries.push(null); // line separator
    studentOperationsMenuEntries.push({name : "Hide selected cells", functionName : "studentMatrixHideRange"});
    studentOperationsMenuEntries.push({name : "Unhide and reset selected cells", functionName : "studentMatrixRevealRange"});
    studentOperationsMenuEntries.push({name : "Set colors of selected cells", functionName : "studentMatrixSetColor"});
    studentOperationsMenuEntries.push({name : "Set content of selected cells", functionName : "studentMatrixSetContent"});
    studentOperationsMenuEntries.push(null); // line separator
    studentOperationsMenuEntries.push({name : "Count status for selected cells", functionName : "studentMatrixCount"});
    studentOperationsMenuEntries.push(null); // line separator
    studentOperationsMenuEntries.push({name : "Add a new sheet from the template", functionName : "studentMatrixAddTemplateSheet"});
    studentOperationsMenuEntries.push({name : "What tab is this sheet using?", functionName : "studentMatrixInspectSourceTab"});
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu("StudentMatrix " + studentMatrixVersion(), globalMenuEntries);
  SpreadsheetApp.getActiveSpreadsheet().addMenu('Student sheets', studentOperationsMenuEntries);
};

/**
 * Helper function to check whether a given sheet exists in the active spreadsheet.
 */
function sheetExists(sheetName) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getName();
    return true;
  }
  catch (err) {
    return false;
  }
}

/**
 * Displays a list of all students in a popup panel with checkboxes.
 */
function studentMatrixStudents() {
  var app = UiApp.createApplication().setTitle("Students");
  var panel = app.createVerticalPanel().setHeight("100%");
  app.add(app.createScrollPanel(panel).setHeight("100%"));

  var studentData = STUDENT_SHEET.getRange(2, 1, NUMBER_OF_STUDENTS, 2).getValues();
  var checkboxes = [];
  var handler = app.createServerHandler("studentMatrixStudentSelect");
  for (var student in studentData) {
    checkboxes[student] = app.createCheckBox(studentData[student][1]).setValue(studentData[student][0] == 1).addClickHandler(handler).setId(2 + parseInt(student)).setName(2 + parseInt(student));
    panel.add(checkboxes[student]);
  }

  var done = app.createButton('Done').addClickHandler(handler).setId('done');
  var selectAll = app.createButton('Select all').addClickHandler(handler).setId('selectAll');
  panel.add(done);
  panel.add(selectAll);

  SpreadsheetApp.getActiveSpreadsheet().show(app);
  return app;
}

/**
 * Handler for selecting/deselecting students marked for update.
 */
function studentMatrixStudentSelect(eventInfo) {
  // Check if a button has been clicked, and if so take appropriate actions.
  if (eventInfo.parameter.source == 'selectAll') {
    var range = STUDENT_SHEET.getRange(2, 1, NUMBER_OF_STUDENTS);
    range.setValue(1);

    // Update the menu to show the number of selected students.
    buildMenu({'selected students' : 'all'});
    SpreadsheetApp.getActiveSpreadsheet().toast("", "All students selected.");
    var app = UiApp.getActiveApplication();
    app.close();

    return app;
  }
  if (eventInfo.parameter.source == 'done') {
    // Update the menu to show the number of selected students.
    var values = STUDENT_SHEET.getRange(2, 1, NUMBER_OF_STUDENTS).getValues();
    var selected = 0;
    for (var row in values) {
      if (values[row][0] == 1) {
        selected++;
      }
    }
    if (selected == NUMBER_OF_STUDENTS) {
      selected = 'all';
    }
    buildMenu({'selected students' : selected});

    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }

  // If no button is clicked, we should toggle the 0/1 state of a student cell.
  // The cell row is the same as the ID of the checkbox being clicked.
  cell = STUDENT_SHEET.getRange(eventInfo.parameter.source, 1);
  if (cell.getValue() == 1) {
    cell.setValue(0);
  }
  else {
    cell.setValue(1);
  }
}

/**
 * Sets the 'update' status for a student, after update.
 */
function studentMatrixMarkDone(row, status) {
  if (studentMatrixGetConfig("resetUpdateColumn") == 1) {
    if (status == false) {
      STUDENT_SHEET.getRange(row, 1).setValue("fail");
    }
    else {
      var now = new Date;
      STUDENT_SHEET.getRange(row, 1).setValue(now);
    }
  }
}

/**
 * Check if a student row is marked for update.
 *
 * If marked for update, the "fetch" parameter can be used to load a related student file:
 *   - "sheet" will load a spreadsheet, using sheet ID from column 4.
 *   - "document" will load a document, using sheet ID from column 5.
 */
function studentMatrixGetStudentSheet(row, fetch) {
  if (STUDENT_SHEET.getRange(row, 1).getValue() == 1) {
    // If asked to return a sheet, try loading and returning it.
    if (fetch == "sheet") {
      var sheetKey = STUDENT_SHEET.getRange(row, 4).getValue();
      try {
        var sheet = SpreadsheetApp.openById(sheetKey);
      }
      catch (err) {
        SpreadsheetApp.getActiveSpreadsheet().toast('Bad sheet key on row ' + row + '. Skipping.', 'Error')
        studentMatrixMarkDone(row, false);
        return false;
      }
      studentMatrixMarkDone(row, true);
      return sheet;
    }

    // If asked to return a document, try loading and returning it.
    if (fetch == "document") {
      var documentKey = STUDENT_SHEET.getRange(row, 5).getValue();
      try {
        var document = DocsList.getFileById(documentKey);
      }
      catch (err) {
        SpreadsheetApp.getActiveSpreadsheet().toast('Bad document key on row ' + row + '. Skipping.', 'Error')
        studentMatrixMarkDone(row, false);
        return false;
      }
      studentMatrixMarkDone(row, true);
      return document;
    }

    // No specific type of file should be returned – just return that this row should be updated.
    studentMatrixMarkDone(row, true);
    return true;
  }
  // Not marked for update.
  return false;
}

/**
 * Assures that there is a folder matching the config.
 */
function studentMatrixAssureFolder() {
  try {
    var folder = DocsList.getFolder(studentMatrixGetConfig("folder"));
  }
  catch (err) {
    var folder = DocsList.createFolder(studentMatrixGetConfig("folder"));
    var masterSheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
    DocsList.getFileById(masterSheetID).addToFolder(folder);
  }
}

/**
 * Creates a "students" sheet, and populates with relevant information.
 */
function studentMatrixCreateStudentList() {
  // Check if there is already a sheet, and allow the user to bail out.
  if (sheetExists("students")) {
    var response = Browser.msgBox("Student sheet already exists. Rewrite it?", Browser.Buttons.OK_CANCEL);
    if (response == "cancel") {
      return;
    }
  }
  else {
    STUDENT_SHEET = SpreadsheetApp.getActiveSpreadsheet().insertSheet("students");
  }

  // Set column headers.
  STUDENT_SHEET.getRange(1, 1, 1, 11).setValues(
    [["Update", "Student name/id", "Student email", "Student matrix key", "Student document key", "Student matrix link", "Student document link", "OK count", "Review count", "Unlocked count", "Khan Academy ID"]]
  );
  STUDENT_SHEET.hideColumns(4);
  STUDENT_SHEET.hideColumns(5);
  STUDENT_SHEET.setFrozenRows(1);
}

/**
 * Creates a spreadsheet for template and adds its key to the config.
 */
function studentMatrixCreateTemplateSheet() {
  var name = Browser.inputBox("Name for template spreadsheet");
  SpreadsheetApp.getActiveSpreadsheet().toast('Creating new template...');
  studentMatrixAssureFolder();
  var template = SpreadsheetApp.create(name);
  DocsList.getFileById(template.getId()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));
  ScriptProperties.setProperty('spreadsheetTemplate', template.getId());

  var app = UiApp.createApplication().setTitle("Matrix template created");
  app.add(app.createLabel('The template is placed in the folder used for this class. You can also find a link to the matrix template in the StudentMatrix settings.'));
  app.add(app.createLabel('Please edit the spreadsheet and customize it to fit your needs. You can add several sheets as well, though only one will be used when making mass updates to student matrices. (Edit the settings if you want to change which sheet to use.)'));
  app.add(app.createLabel('When you are done customizing the matrix template, you probably want to do the following:'));
  app.add(app.createLabel('1: Create a copy of the template for each student.'));
  app.add(app.createLabel('2: Copy the template into this master template, to allow mass updates to student matrices.'));
  app.add(app.createLabel(''));
  app.add(app.createLabel('You will find options for both these actions in the StudentMatrix menu.'));
  app.add(app.createAnchor('Edit template', true, template.getUrl()));

  // Rebuild menu -- the option for adding a new template should be hidden.
  buildMenu();
  SpreadsheetApp.getActiveSpreadsheet().show(app);
}

/**
 * Creates new spreadsheets/documents for students who don't already have one.
 */
function studentMatrixCreateStudentSheets() {
  var editorMails = studentMatrixGetConfig("editorMails").split(" ");
  var verboseCreation = studentMatrixGetConfig("verboseCreation");

  var templateSheetKey = studentMatrixGetConfig("spreadsheetTemplate");
  var spreadsheetSuffix = studentMatrixGetConfig("spreadsheetSuffix");
  var spreadsheetPublic = studentMatrixGetConfig("spreadsheetPublic");
  var spreadsheetViewable = studentMatrixGetConfig("spreadsheetStudentViewable");
  var spreadsheetEditable = studentMatrixGetConfig("spreadsheetStudentEditable");
  var templateSpreadsheet = SpreadsheetApp.openById(templateSheetKey);

  var documentEnable = studentMatrixGetConfig("documentEnable");
  if (documentEnable == 'true') {
    var documentTemplateKey = studentMatrixGetConfig("documentTemplate");
    var documentTemplate = DocsList.getFileById(documentTemplateKey);
    var documentSuffix = studentMatrixGetConfig("documentSuffix");
    var documentPublic = studentMatrixGetConfig("documentPublic");
    var documentViewable = studentMatrixGetConfig("documentViewable");
    var documentCommentable = studentMatrixGetConfig("documentCommentable");
    var documentEditable = studentMatrixGetConfig("documentEditable");
  }

  // This function is usually the first one you run when you set up StudentMatrix.
  // Let's verify that the tab name for the template sheet exists, and correct the
  // setting if not.
  try {
    var tmp = templateSpreadsheet.getSheetByName(studentMatrixGetSourceTab()).getName();
  }
  catch (err) {
    ScriptProperties.setProperty('spreadsheetTab', templateSpreadsheet.getActiveSheet().getName());
  }
  studentMatrixAssureFolder();

  // Go through all the students and create new stuff as necessary.
  for (var row = FIRST_STUDENT_ROW; row <= LAST_STUDENT_ROW; row++) {
    // Check if the row is marked for update.
    if (studentMatrixGetStudentSheet(row, '')) {

      // If the student doesn't have any spreadsheet yet, create one.
      if (STUDENT_SHEET.getRange(row, 4).isBlank()) {
        SpreadsheetApp.getActiveSpreadsheet().toast('Creating matrix', STUDENT_SHEET.getRange(row, 2).getValue());
        var newSheet = templateSpreadsheet.copy(STUDENT_SHEET.getRange(row, 2).getValue() + spreadsheetSuffix);
        // Set links/references to the new sheet.
        STUDENT_SHEET.getRange(row, 4).setValue(newSheet.getId());
        STUDENT_SHEET.getRange(row, 6).setValue(newSheet.getUrl());

        // Apply extra permissons according to settings. Permissions needs to be
        // wrapped in try statements, since e-mails might not be connected to Gmail
        // accounts, which will cause script errors.

        if (studentMatrixGetConfig('editorMails') != '') {
          try {
            newSheet.addEditors(editorMails);
          }
          catch (err) {
            SpreadsheetApp.getActiveSpreadsheet().toast('Some of the editor emails could not be used: ' + studentMatrixGetConfig('editorMails'), 'Error');
          }
        }
        // If the option to make student editor of one sheet only is set, we need a bit of complex processing.
        if (studentMatrixGetConfig('spreadsheetTabStudent') != '(none)') {
          var permissions;
          var accountMail = STUDENT_SHEET.getRange(row, 3).getValue();
          // Get all the editors for the spreadsheet.
          var users = newSheet.getEditors();
          targetSheets = newSheet.getSheets();
          // Go through all sheets, and explicitly set who is allow to edit.
          for (var sheet in targetSheets) {
            // Make all sheets protected, except the one that the student should be able to edit.
            if (targetSheets[sheet].getName() != studentMatrixGetConfig('spreadsheetTabStudent')) {
              permissions = targetSheets[sheet].getSheetProtection();
              permissions.setProtected(true);
              for (user in users) {
                permissions.addUser(users[user]);
              }
              targetSheets[sheet].setSheetProtection(permissions);
            }
          }
        }
        if (spreadsheetPublic == 'true') {
          newSheet.setAnonymousAccess(true, false);
        }
        if (spreadsheetViewable == 'true') {
          try {
            newSheet.addViewer(STUDENT_SHEET.getRange(row, 3).getValue());
          }
          catch (err) {
            SpreadsheetApp.getActiveSpreadsheet().toast('Student email cannot be used for permission: ' + STUDENT_SHEET.getRange(row, 3).getValue() + '. (Must be tied to a Gmail account.)', 'Error');
          }
        }
        // If the option to make student editor of one sheet only is set, the student must be added as an editor.
        if (spreadsheetEditable == 'true' || studentMatrixGetConfig('spreadsheetTabStudent') != '(none)') {
          try {
            newSheet.addEditor(STUDENT_SHEET.getRange(row, 3).getValue());
          }
          catch (err) {
            SpreadsheetApp.getActiveSpreadsheet().toast('Student email cannot be used for permission: ' + STUDENT_SHEET.getRange(row, 3).getValue() + '. (Must be tied to a Gmail account.)', 'Error');
          }
        }
      }

      // If there is a sheet key but no link, create a link.
      if (STUDENT_SHEET.getRange(row, 6).isBlank() && !STUDENT_SHEET.getRange(row, 4).isBlank()) {
        newSheet = SpreadsheetApp.openById(STUDENT_SHEET.getRange(row, 4).getValue());
        STUDENT_SHEET.getRange(row, 6).setValue(newSheet.getUrl());
      }

      // Add the sheet to the proper folder.
      DocsList.getFileById(STUDENT_SHEET.getRange(row, 4).getValue()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));

      // Do similar procedure for documents.
      if (documentEnable == 'true') {
        if (STUDENT_SHEET.getRange(row, 5).isBlank()) {
          SpreadsheetApp.getActiveSpreadsheet().toast('Creating feedback document', STUDENT_SHEET.getRange(row, 2).getValue());

          var newDocument = documentTemplate.makeCopy(STUDENT_SHEET.getRange(row, 2).getValue() + documentSuffix);
          // Set links/references to the new document.
          STUDENT_SHEET.getRange(row, 5).setValue(newDocument.getId());
          // If the document is open to anyone with the link, the link should be differently formatted.
          // There is currently no API support for this, so we do this hack instead.
          //STUDENT_SHEET.getRange(row, 7).setValue(newDocument.getUrl());
          STUDENT_SHEET.getRange(row, 7).setValue('https://docs.google.com/document/d/' + newDocument.getId() + '/edit?usp=sharing');


          // Apply extra permissons according to settings.
          if (studentMatrixGetConfig('editorMails') != '') {
            try {
              newDocument.addEditors(editorMails);
            }
            catch (err) {
              SpreadsheetApp.getActiveSpreadsheet().toast('Some of the editor emails could not be used: ' + studentMatrixGetConfig('editorMails'), 'Error');
            }
          }
// This function isn't available for documents, it seems.
//          if (documentPublic == 'true') {
//            newDocument.setAnonymousAccess(true, false);
//          }
          if (documentViewable == 'true') {
            try {
              newDocument.addViewer(STUDENT_SHEET.getRange(row, 3).getValue());
            }
            catch (err) {
              SpreadsheetApp.getActiveSpreadsheet().toast('Student email cannot be used for permission: ' + STUDENT_SHEET.getRange(row, 3).getValue() + '. (Must be tied to a Gmail account.)', 'Error');
            }
          }
// And there doesn't seem to be any API for adding people who can comment, either. :-(
//          if (documentCommentable == 'true') {
//            newDocument.addCommentator(STUDENT_SHEET.getRange(row, 3).getValue());
//          }
          if (documentEditable == 'true') {
            try {
              newDocument.addEditor(STUDENT_SHEET.getRange(row, 3).getValue());
            }
            catch (err) {
              SpreadsheetApp.getActiveSpreadsheet().toast('Student email cannot be used for permission: ' + STUDENT_SHEET.getRange(row, 3).getValue() + '. (Must be tied to a Gmail account.)', 'Error');
            }
          }
        }

        // If there is a document key but no link, create a link.
        if (STUDENT_SHEET.getRange(row, 7).isBlank() && !STUDENT_SHEET.getRange(row, 5).isBlank()) {
          newDocument = DocsList.getFileById(STUDENT_SHEET.getRange(row, 5).getValue());
          STUDENT_SHEET.getRange(row, 7).setValue(newDocument.getUrl());
        }

        // Add the document to the appropriate folder.
        DocsList.getFileById(STUDENT_SHEET.getRange(row, 5).getValue()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));
      }
    }
  }
}

/**
 * Creates a document template used for emails to the students.
 */
function studentMatrixCreateMailTemplate() {
  var name = Browser.inputBox('Name for email template document');
  SpreadsheetApp.getActiveSpreadsheet().toast('Creating new template...');
  var template = DocsList.getFileById(studentMatrixGetConfig('emailTemplate')).makeCopy(name);
  studentMatrixAssureFolder();
  DocsList.getFileById(template.getId()).addToFolder(DocsList.getFolder(studentMatrixGetConfig('folder')));
  ScriptProperties.setProperty('emailTemplate', template.getId());

  var app = UiApp.createApplication().setTitle('E-mail template created');
  app.add(app.createLabel('The template is placed in the folder used for this class. You can also find a link to the e-mail template in the StudentMatrix settings.'));
  app.add(app.createLabel('Note that you can use replacement patterns like [column-NN] to dynamically insert content from column NN in the student sheet.'));
  app.add(app.createLabel('Send the actual e-mail by running the relevant action from the StudentMatrix menu.'));
  app.add(app.createAnchor('View template', true, template.getUrl()));

  SpreadsheetApp.getActiveSpreadsheet().show(app);
}

/**
 * Creats sums of cell status based on student sheets, for selected range.
 *
 * This function checks all the selected students, for the selected cells, and
 * counts the number of ok cells, review-marked cells and unlocked cells. The
 * result is stored in the student tab of the master document.
 */
function studentMatrixCount() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig('spreadsheetColorUnlocked');
  var colorOk = studentMatrixGetConfig('spreadsheetColorOk');
  var colorReview = studentMatrixGetConfig('spreadsheetColorReview');

  // Loop through the selected students.
  for (var studentRow = 2; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      // If the student isn't included in the action, remove any entries on this row.
      STUDENT_SHEET.getRange(studentRow, 8).setValue("");
      STUDENT_SHEET.getRange(studentRow, 9).setValue("");
      STUDENT_SHEET.getRange(studentRow, 10).setValue("");
      continue;
    }
    var targetRange = targetSheet.getSheetByName(studentMatrixGetSourceTab()).getRange(sourceCells.getA1Notation());

    var unlockedCount = 0;
    var okCount = 0;
    var reviewCount = 0;

    // Crawl through the selection in the student matrix count cells with matching background colors.
    var backgrounds = targetRange.getBackgrounds();
    for (var row in backgrounds) {
      for (var column in backgrounds[row]) {
        switch (backgrounds[row][column]) {
          case colorUnlocked:
            unlockedCount++;
            break;
          case colorOk:
            okCount++;
            break;
          case colorReview:
            reviewCount++;
            break;
        }
      }
    }
    // Write out the count in the student tab.
    STUDENT_SHEET.getRange(studentRow, 8, 1, 3).setValues([[okCount, reviewCount, unlockedCount]]);
  }
};

/**
 * Sends an email to each of the students marked for update, with links to matrix + document.
 */
function studentMatrixNotify() {
  var messageTemplate = DocumentApp.openById(studentMatrixGetConfig("emailTemplate")).getText();

  var subject = Browser.inputBox("Email subject.");

  // Go through all the students and send an email.
  for (var row = 2; row <= LAST_STUDENT_ROW; row++) {
    // Check if the row is marked for update.
    if (studentMatrixGetStudentSheet(row, '')) {
      var message = messageTemplate;
      for (var column = 1; column <= STUDENT_SHEET.getLastColumn(); column++) {
        while (message.indexOf("[column-" + column + "]") > -1) {
          message = message.replace("[column-" + column + "]", STUDENT_SHEET.getRange(row, column).getValue());
        }
      }

      // Send out the email.
      MailApp.sendEmail(STUDENT_SHEET.getRange(row, 3).getValue(), subject, message);
    }
  }
}

/**
 * Adds a new sheet, cloned from the template specified in the settings.
 */
function studentMatrixAddTemplateSheet() {
  var app = UiApp.createApplication().setTitle("Copy a sheet from the template");
  var handler = app.createServerHandler("studentMatrixAddTemplateSheetHandler");

  var sourceTab = app.createListBox().setName('sourceTab');
  handler.addCallbackElement(sourceTab);
  var sheets = studentMatrixGetTemplateTabs();
  for (var i in sheets) {
    sourceTab.addItem(sheets[i]);
  }
  app.add(app.createLabel('Tab to copy from template'));
  app.add(sourceTab);

  var tabName = app.createTextBox().setName('tabName');
  handler.addCallbackElement(tabName);
  app.add(app.createLabel('Name for the new tab in the master spreadsheet'));
  app.add(tabName);

  app.add(app.createButton("Save").addClickHandler(handler));

  SpreadsheetApp.getActiveSpreadsheet().show(app);
  return app;

}

/**
 * Submit handler for copying from a sheet from template to master.
 */
function studentMatrixAddTemplateSheetHandler(eventInfo) {
  // Get data from the submitted panel.
  var sourceTab = eventInfo.parameter['sourceTab'];
  var tabName = eventInfo.parameter['tabName'];
  // Create a new sheet, move it in front of the active sheet, and set it active.
  var index = SpreadsheetApp.getActive().getActiveSheet().getIndex();
  var newSheet = SpreadsheetApp.openById(studentMatrixGetConfig("spreadsheetTemplate")).getSheetByName(sourceTab).copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(tabName);
  newSheet.activate();
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(index);

  // Ensure that the ScriptProperty 'studentMatrixSheetKeys' has a valid format.
  try {
    var sheetKeys = JSON.parse(ScriptProperties.getProperty('studentMatrixSheetKeys'));
  }
  catch(e) {
    ScriptProperties.setProperty('studentMatrixSheetKeys', JSON.stringify([]));
  }

  // Store the connection between this sheet and the source sheet in the template.
  if (typeof sheetKeys != 'object') {
    sheetKeys = {};
    Browser.msgBox(typeof sheetKeys);
  }
  sheetKeys[newSheet.getSheetId()] = sourceTab;
  ScriptProperties.setProperty('studentMatrixSheetKeys', JSON.stringify(sheetKeys));

  var app = UiApp.getActiveApplication();
  app.close();
  return app;
}

/**
 * Helper function returning the name of the tab the active sheet is connected to in the template
 */
function studentMatrixGetSourceTab() {
  var sheetKeys = JSON.parse(ScriptProperties.getProperty('studentMatrixSheetKeys'));
  var tabID = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSheetId();
  return sheetKeys[tabID];
}

/**
 * Shows which tab the active sheet is working against.
 */
function studentMatrixInspectSourceTab() {
  Browser.msgBox('This sheet is connected to \'' + studentMatrixGetSourceTab() + '\' in the student matrices.');
}

/**
 * Change the content of the selected cells, in all student sheets marked for update.
 */
function studentMatrixSetContent() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());

    // Get the target spreadsheet to update.
    cells = sourceCells.getValues();
    for (var row in cells) {
      for (var column in cells[row]) {
        // For some reason we need to parse these variables to integers to make things work.
        var targetRow = parseInt(row) + parseInt(sourceCells.getRow());
        var targetColumn = parseInt(column) + parseInt(sourceCells.getColumn());
        if (sourceCells.getFormulas()[row][column] != "") {
          targetSheet.getRange(targetRow, targetColumn).setFormula(sourceCells.getFormulas()[row][column]);
        }
        else {
          targetSheet.getRange(targetRow, targetColumn).setValue(sourceCells.getValues()[row][column]);
        }
      }
    }
  }
};

/**
 * Change the colors of the selected cells, in all student sheets marked for update.
 */
function studentMatrixSetColor() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());
    targetSheet.getRange(sourceCells.getRow(), sourceCells.getColumn(), sourceCells.getNumRows(), sourceCells.getNumColumns()).setBackgroundColors(sourceCells.getBackgrounds());
  }
};

/**
 * Turn any non-review cells in selection to OK color, in all student sheets marked for update.
 *
 * Only cells color-coded as approved will be included in this operation.
 */
function studentMatrixSoftOk() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());

    // Crawl through the selection in the template sheet and find cells that should be updated in the target sheet.
    var backgrounds = sourceCells.getBackgrounds();
    for (var row in backgrounds) {
      for (var column in backgrounds[row]) {
        if (backgrounds[row][column] == colorOk) {
          var targetRow = parseInt(row) + parseInt(sourceCells.getRow());
          var targetColumn = parseInt(column) + parseInt(sourceCells.getColumn());
          // Don't forget to check if the cell was already ok – we don't want to mark it not ok.
          if (targetSheet.getRange(targetRow, targetColumn).getBackgroundColor() != colorReview) {
            targetSheet.getRange(targetRow, targetColumn).setBackgroundColor(colorOk);
          }
        }
      }
    }
  }
};

/**
 * Sets cell color to ok, for all selected students.
 *
 * Only cells color-coded as approved in the template will be included in this operation.
 */
function studentMatrixOk() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());

    // Crawl through the selection in the template sheet and find cells that should be updated in the target sheet.
    var backgrounds = sourceCells.getBackgrounds();
    for (var row in backgrounds) {
      for (var column in backgrounds[row]) {
        if (backgrounds[row][column] == colorOk) {
          var targetRow = parseInt(row) + parseInt(sourceCells.getRow());
          var targetColumn = parseInt(column) + parseInt(sourceCells.getColumn());
          targetSheet.getRange(targetRow, targetColumn).setBackgroundColor(colorOk);
        }
      }
    }
  }
};

/**
 * Iterates through the selected cells and degrades student cells to review status.
 *
 * This function will only affect cells that are marked OK or review in the
 * (active) template sheet, and only cells that are marked OK in the student
 * sheets.
 */
function studentMatrixReview() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());

    // Crawl through the selection in the template sheet and find cells that should be updated in the target sheet.
    var backgrounds = sourceCells.getBackgrounds();
    for (var row in backgrounds) {
      for (var column in backgrounds[row]) {
        if (backgrounds[row][column] == colorUnlocked || backgrounds[row][column] == colorOk || backgrounds[row][column] == colorReview) {
          var targetRow = parseInt(row) + parseInt(sourceCells.getRow());
          var targetColumn = parseInt(column) + parseInt(sourceCells.getColumn());
          // Only update if the target cell is set to OK.
          if (targetSheet.getRange(targetRow, targetColumn).getBackgroundColor() == colorOk) {
            targetSheet.getRange(targetRow, targetColumn).setBackgroundColor(colorReview);
          }
        }
      }
    }
  }
}

/**
 * Turn any non-approved cells in selection to unlocked color, in all student sheets marked for update.
 *
 * Only cells color-coded as unlocked or approved will be included in this operation.
 */
function studentMatrixUnlock() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetSourceTab());

    // Crawl through the selection in the template sheet and find cells that should be updated in the target sheet.
    var backgrounds = sourceCells.getBackgrounds();
    for (var row in backgrounds) {
      for (var column in backgrounds[row]) {
        if (backgrounds[row][column] == colorUnlocked || backgrounds[row][column] == colorOk) {
          var targetRow = parseInt(row) + parseInt(sourceCells.getRow());
          var targetColumn = parseInt(column) + parseInt(sourceCells.getColumn());
          // Don't forget to check if the cell was already ok – we don't want to mark it not ok.
          if (targetSheet.getRange(targetRow, targetColumn).getBackgroundColor() != colorOk && targetSheet.getRange(targetRow, targetColumn).getBackgroundColor() != colorReview) {
            targetSheet.getRange(targetRow, targetColumn).setBackgroundColor(colorUnlocked);
          }
        }
      }
    }
  }
};
