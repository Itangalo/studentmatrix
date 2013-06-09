// Written by Johan Falk, Sweden.
// Published under GNU General Public License, version 3 (GPL-3.0)
// See restrictions at http://www.opensource.org/licenses/gpl-3.0.html

function studentMatrixVersion() {
  return "1.11-beta";
}

/**
 * Display help link and version information.
 */
function studentMatrixHelp() {
  Browser.msgBox("Version " + studentMatrixVersion() + ". See https://github.com/Itangalo/studentmatrix for project information and documentation. Some Swedish video guides can be found at http://tinyurl.com/studentmatrix-videor.");
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
function buildMenu() {
  var menuEntries = [];
  if (sheetExists("students")) {
    menuEntries.push({name : "Select students", functionName : "studentMatrixStudents"});
    menuEntries.push(null); // line separator
    menuEntries.push({name : "Student sheets: Unlock selected cells", functionName : "studentMatrixUnlock"});
    menuEntries.push({name : "Student sheets: Degrade selected cells to review status", functionName : "studentMatrixReview"});
    menuEntries.push({name : "Student sheets: Mark cells ok", functionName : "studentMatrixOk"});
    menuEntries.push({name : "Student sheets: Mark cells ok, unless marked for review", functionName : "studentMatrixSoftOk"});
    menuEntries.push(null); // line separator
    menuEntries.push({name : "Student sheets: Set colors of selected cells", functionName : "studentMatrixSetColor"});
    menuEntries.push({name : "Student sheets: Set content of selected cells", functionName : "studentMatrixSetContent"});
    menuEntries.push(null); // line separator
    menuEntries.push({name : "Count cell status", functionName : "studentMatrixCount"});
    menuEntries.push({name : "Send email to students", functionName : "studentMatrixNotify"});
    menuEntries.push({name : "Create new email template", functionName : "studentMatrixCreateMailTemplate"});
  }

  menuEntries.push(null); // line separator
  if (studentMatrixGetConfig("version") != studentMatrixVersion()) {
    menuEntries.push({name : "Setup: Rewrite settings sheets", functionName : "studentMatrixCreateSettingsSheet"});
  }
  if (studentMatrixGetConfig("spreadsheetTemplate") == "") {
    menuEntries.push({name : "Setup: Create template sheet", functionName : "studentMatrixCreateTemplateSheet"});
  }
  else {
    menuEntries.push({name : "Setup: Create student sheets", functionName : "studentMatrixCreateStudentSheets"});
    menuEntries.push({name : "Setup: Copy template to master sheet", functionName : "studentMatrixAddTemplateSheet"});
    menuEntries.push(null); // line separator
  }

  menuEntries.push({name : "Help", functionName : "studentMatrixHelp"});
  menuEntries.push({name : "StudentMatrix settings", functionName : "studentMatrixSettings"});

  // Only add these entries if there is a sheet called "Khan exercises".
  if (sheetExists("Khan exercises")) {
    menuEntries.push(null); // line separator
    menuEntries.push({name : "Khan Academy: Read and update exercises", functionName : "khanUpdate"});
    if (sheetExists("Khan goals")) {
      menuEntries.push({name : "Khan Academy: Read and update goals", functionName : "khanGoals"});
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu("StudentMatrix " + studentMatrixVersion(), menuEntries);
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

  var studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var studentData = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1, 2).getValues();
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


  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.show(app);
  return app;
}

/**
 * Handler for selecting/deselecting students marked for update.
 */
function studentMatrixStudentSelect(eventInfo) {
  // Check if a button has been clicked, and if so take appropriate actions.
  if (eventInfo.parameter.source == 'selectAll') {
    var studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
    var range = studentSheet.getRange(2, 1, studentSheet.getLastRow() - 1);
    range.setValue(1);

    SpreadsheetApp.getActiveSpreadsheet().toast("", "All students selected.", 1);
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }
  if (eventInfo.parameter.source == 'done') {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }

  // If no button is clicked, we should toggle the 0/1 state of a student cell.
  // The cell row is the same as the ID of the checkbox being clicked.
  cell = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(eventInfo.parameter.source, 1);
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
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 1).setValue("fail");
    }
    else {
      var now = new Date;
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 1).setValue(now);
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
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 1).getValue() == 1) {
    // If asked to return a sheet, try loading and returning it.
    if (fetch == "sheet") {
      var sheetKey = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 4).getValue();
      try {
        var sheet = SpreadsheetApp.openById(sheetKey);
      }
      catch (err) {
        Browser.msgBox("Bad sheet key on row " + row + ". Skipping.");
        studentMatrixMarkDone(row, false);
        return false;
      }
      studentMatrixMarkDone(row, true);
      return sheet;
    }

    // If asked to return a document, try loading and returning it.
    if (fetch == "document") {
      var documentKey = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 5).getValue();
      try {
        var document = DocsList.getFileById(documentKey);
      }
      catch (err) {
        Browser.msgBox("Bad document key on row " + row + ". Skipping.");
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
    var tmp = DocsList.getFolder(studentMatrixGetConfig("folder"));
  }
  catch (err) {
    DocsList.createFolder(studentMatrixGetConfig("folder"));
  }
}

/**
 * Creates tabs (spreadsheets) called "config" and "students", and populates with relevant information.
 */
function studentMatrixCreateSettingsSheet() {
  // Create a new sheet for settings, if there isn't already one.
  configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config");
  if (configSheet == null) {
    configSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("config");
  }
  else {
    var response = Browser.msgBox("Config sheet already exists. Rewrite it?", Browser.Buttons.OK_CANCEL);
    if (response == "cancel") {
      return;
    }
  }
  // Set column headers.
  configSheet.setFrozenRows(1);
  configSheet.getRange("A:A").clear();
  configSheet.setColumnWidth(1, 300);
  configSheet.getRange(1, 1).setValue("Setting");
  configSheet.getRange(1, 2).setValue("Value");
  // Set the names of the settings.
  var config = studentMatrixConfig();
  for (var entry in config) {
    configSheet.getRange(config[entry]["row"], 1).setValue(config[entry]["name"]);
    if (config[entry]["description"]) {
      configSheet.getRange(config[entry]["row"], 1).setComment(config[entry]["description"]);
    }
  }

  // Mark that the config version has been updated.
  configSheet.getRange(config["version"]["row"], 2).setValue(studentMatrixVersion());

  // Create a new sheet for students, if there isn't already one.
  studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students");
  if (studentSheet == null) {
    studentSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("students");
  }
  else {
    var response = Browser.msgBox("Student sheet already exists. Rewrite it?", Browser.Buttons.OK_CANCEL);
    if (response == "cancel") {
      return;
    }
  }
  // Set column headers.
  studentSheet.getRange(1, 1).setValue("Update");
  studentSheet.getRange(1, 2).setValue("Student name/id");
  studentSheet.getRange(1, 3).setValue("Student email");
  studentSheet.getRange(1, 4).setValue("Student matrix key");
  studentSheet.hideColumns(4);
  studentSheet.getRange(1, 5).setValue("Student document key");
  studentSheet.hideColumns(5);
  studentSheet.getRange(1, 6).setValue("Student matrix link");
  studentSheet.getRange(1, 7).setValue("Student document link");
  studentSheet.getRange(1, 8).setValue("OK count");
  studentSheet.getRange(1, 9).setValue("Review count");
  studentSheet.getRange(1, 10).setValue("Unlocked count");
  studentSheet.getRange(1, 11).setValue("Khan Academy ID");
  studentSheet.setFrozenRows(1);
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
  app.add(app.createAnchor('Edit template', true, template.getUrl()));
  
  SpreadsheetApp.getActiveSpreadsheet().show(app);
}

/**
 * Creates new spreadsheets/documents for students who don't already have one.
 */
function studentMatrixCreateStudentSheets() {
  var studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var editorMails = studentMatrixGetConfig("editorMails").split(" ");
  var verboseCreation = studentMatrixGetConfig("verboseCreation");

  var templateSheetKey = studentMatrixGetConfig("spreadsheetTemplate");
  var spreadsheetSuffix = studentMatrixGetConfig("spreadsheetSuffix");
  var spreadsheetPublic = studentMatrixGetConfig("spreadsheetPublic");
  var spreadsheetViewable = studentMatrixGetConfig("spreadsheetStudentViewable");
  var spreadsheetEditable = studentMatrixGetConfig("spreadsheetStudentEditable");
  var templateSpreadsheet = SpreadsheetApp.openById(templateSheetKey);

  var documentEnable = studentMatrixGetConfig("documentEnable");
  if (documentEnable == 1) {
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
    var tmp = templateSpreadsheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab")).getName();
  }
  catch (err) {
    var row = studentMatrixConfig()["spreadsheetTab"]["row"];
    var spreadsheetTab = templateSpreadsheet.getActiveSheet().getName();
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config").getRange(row, 2).setValue(spreadsheetTab);
  }
  studentMatrixAssureFolder();

  // Go through all the students and create new stuff as necessary.
  for (var row = 2; row <= studentSheet.getLastRow(); row++) {
    // Check if the row is marked for update.
    if (studentMatrixGetStudentSheet(row, "")) {

      // If the student doesn't have any spreadsheet yet, create one.
      if (studentSheet.getRange(row, 4).isBlank()) {
        if (verboseCreation == 1) {
          Browser.msgBox("Creating spreadsheet for " + studentSheet.getRange(row, 2).getValue());
        }
        var newSheet = templateSpreadsheet.copy(studentSheet.getRange(row, 2).getValue() + spreadsheetSuffix);
        // Set links/references to the new sheet.
        studentSheet.getRange(row, 4).setValue(newSheet.getId());
        studentSheet.getRange(row, 6).setValue(newSheet.getUrl());

        // Apply extra permissons according to settings.
        try {
          newSheet.addEditor(editorMails);
        }
        catch (err) {
        }
        if (spreadsheetPublic == 1) {
          newSheet.setAnonymousAccess(true, false);
        }
        if (spreadsheetViewable == 1) {
          newSheet.addViewer(studentSheet.getRange(row, 3).getValue());
        }
        if (spreadsheetEditable == 1) {
          newSheet.addEditor(studentSheet.getRange(row, 3).getValue());
        }
      }

      // If there is a sheet key but no link, create a link.
      if (studentSheet.getRange(row, 6).isBlank() && !studentSheet.getRange(row, 4).isBlank()) {
        newSheet = SpreadsheetApp.openById(studentSheet.getRange(row, 4).getValue());
        studentSheet.getRange(row, 6).setValue(newSheet.getUrl());
      }

      // Add the sheet to the proper folder.
      DocsList.getFileById(studentSheet.getRange(row, 4).getValue()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));

      // Do similar procedure for documents.
      if (documentEnable == 1) {
        if (studentSheet.getRange(row, 5).isBlank()) {
          if (verboseCreation == 1) {
            Browser.msgBox("Creating document for " + studentSheet.getRange(row, 2).getValue());
          }

          var newDocument = documentTemplate.makeCopy(studentSheet.getRange(row, 2).getValue() + documentSuffix);
          // Set links/references to the new document.
          studentSheet.getRange(row, 5).setValue(newDocument.getId());
          studentSheet.getRange(row, 7).setValue(newDocument.getUrl());

          // Apply extra permissons according to settings.
          try {
            newDocument.addEditors(editorMails);
          }
          catch (err) {
          }
// This function isn't available for documents, it seems.
//          if (documentPublic == 1) {
//            newDocument.setAnonymousAccess(true, false);
//          }
          if (documentViewable == 1) {
            newDocument.addViewer(studentSheet.getRange(row, 3).getValue());
          }
// And there doesn't seem to be any API for adding people who can comment, either. :-(
//          if (documentCommentable == 1) {
//            newDocument.addCommentator(studentSheet.getRange(row, 3).getValue());
//          }
          if (documentEditable == 1) {
            newDocument.addEditor(studentSheet.getRange(row, 3).getValue());
          }
        }

        // If there is a document key but no link, create a link.
        if (studentSheet.getRange(row, 7).isBlank() && !studentSheet.getRange(row, 5).isBlank()) {
          newDocument = DocsList.getFileById(studentSheet.getRange(row, 5).getValue());
          studentSheet.getRange(row, 7).setValue(newDocument.getUrl());
        }

        // Add the document to the appropriate folder.
        DocsList.getFileById(studentSheet.getRange(row, 5).getValue()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));
      }
    }
  }
}

/**
 * Creates a document template used for emails to the students.
 */
function studentMatrixCreateMailTemplate() {
  var name = Browser.inputBox("Name for email template document");
  SpreadsheetApp.getActiveSpreadsheet().toast('Creating new template...');
  var template = DocsList.getFileById("1tbY8JzstY3Yt2ih78ArRkgz-PvATXAI8OFcU7aGGLCg").makeCopy(name);
  studentMatrixAssureFolder();
  DocsList.getFileById(template.getId()).addToFolder(DocsList.getFolder(studentMatrixGetConfig("folder")));
  ScriptProperties.setProperty('emailTemplate', template.getId());
  
  var app = UiApp.createApplication().setTitle("E-mail template created");
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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();
  var studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Loop through the selected students.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      // If the student isn't included in the action, remove any entries on this row.
      studentSheet.getRange(studentRow, 8).setValue("");
      studentSheet.getRange(studentRow, 9).setValue("");
      studentSheet.getRange(studentRow, 10).setValue("");
      continue;
    }
    var targetRange = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab")).getRange(sourceCells.getA1Notation());

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
    studentSheet.getRange(studentRow, 8).setValue(okCount);
    studentSheet.getRange(studentRow, 9).setValue(reviewCount);
    studentSheet.getRange(studentRow, 10).setValue(unlockedCount);
  }
};

/**
 * Sends an email to each of the students marked for update, with links to matrix + document.
 */
function studentMatrixNotify() {
  var studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var messageTemplate = DocumentApp.openById(studentMatrixGetConfig("emailTemplate")).getText();

  var subject = Browser.inputBox("Email subject.");


  // Go through all the students and send an email.
  for (var row = 2; row <= studentSheet.getLastRow(); row++) {
    // Check if the row is marked for update.
    if (studentMatrixGetStudentSheet(row, "")) {
      var message = messageTemplate;
      for (var column = 1; column <= studentSheet.getLastColumn(); column++) {
        while (message.indexOf("[column-" + column + "]") > -1) {
          message = message.replace("[column-" + column + "]", studentSheet.getRange(row, column).getValue());
        }
      }

      // Send out the email.
      MailApp.sendEmail(studentSheet.getRange(row, 3).getValue(), subject, message);
    }
  }
}

/**
 * Adds a new sheet, cloned from the template specified in the settings.
 */
function studentMatrixAddTemplateSheet() {
  var name = Browser.inputBox("Name for new sheet.");
  var index = SpreadsheetApp.getActive().getActiveSheet().getIndex();
  var newSheet = SpreadsheetApp.openById(studentMatrixGetConfig("spreadsheetTemplate")).getSheetByName(studentMatrixGetConfig("spreadsheetTab")).copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(name);
  newSheet.activate();
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(index);
}

/**
 * Change the content of the selected cells, in all student sheets marked for update.
 */
function studentMatrixSetContent() {
  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));

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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));
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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));

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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));

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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));

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
  if (templateSheet.getName() == "config" || templateSheet.getName() == "students") {
    Browser.msgBox("Cannot use config or student sheets as templates.");
    return;
  }
  var sourceCells = SpreadsheetApp.getActiveRange();

  // Get some settings data.
  var colorUnlocked = studentMatrixGetConfig("spreadsheetColorUnlocked");
  var colorOk = studentMatrixGetConfig("spreadsheetColorOk");
  var colorReview = studentMatrixGetConfig("spreadsheetColorReview");

  // Update the target sheets marked for update.
  for (var studentRow = 2; studentRow <= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getLastRow(); studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, "sheet");
    if (targetSheet == false) {
      continue;
    }
    targetSheet = targetSheet.getSheetByName(studentMatrixGetConfig("spreadsheetTab"));

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
