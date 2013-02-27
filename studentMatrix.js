/**
 * Display help link and version information.
 */
function studentMatrixHelp() {
  Browser.msgBox("Version 1.0 alpha.");
}

/**
 * Adds a custom menu to the active spreadsheet on opening the spreadsheet.
 */
function onOpen() {
  var menuEntries = [];
  menuEntries.push({name : "Unlock student cell colors for selection", functionName : "studentMatrixUnlock"});
  menuEntries.push({name : "Force student cell colors to selected cells", functionName : "studentMatrixSetColor"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Set content of student cells", functionName : "studentMatrixSetContent"});
  menuEntries.push({name : "Add new template sheet", functionName : "studentMatrixAddTemplateSheet"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Create student sheets", functionName : "studentMatrixCreateStudentSheets"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Create settings sheets", functionName : "studentMatrixCreateSettingsSheet"});
  menuEntries.push({name : "Help and version info", functionName : "studentMatrixHelp"});

  menuEntries.push({name : "tmp", functionName : "tmp"});
  SpreadsheetApp.getActiveSpreadsheet().addMenu("Matrix stuff", menuEntries);
};

function tmp() {
  var sheet = studentMatrixGetStudentSheet(2, "document");
  if (sheet == false) {
    Browser.msgBox("Not true.");
  }
  else {
    Browser.msgBox(sheet);
  }
}

function studentMatrixConfig() {
  var config = [];
  config['editorMails'] = {name : "Emails for editors", row : 2};
  config['verboseCreation'] = {name : "Alert for each new file created", row : 3};

  config['spreadsheetTemplate'] = {name : "Key for spreadsheet template", row : 5};
  config['spreadsheetTab'] = {name : "Name of tab with matrix", row : 6};
  config['spreadsheetSuffix'] = {name : "Suffix for spreadsheet titles", row : 7};
  config['spreadsheetColorUnlocked'] = {name : "Color for unlocked matrix cells", row : 8};
  config['spreadsheetColorOk'] = {name : "Color for approved matrix cells", row : 9};
  config['spreadsheetPublic'] = {name : "Make spreadsheets viewable by anyone", row : 10};
  config['spreadsheetStudentViewable'] = {name : "Add student view permission to sheet", row : 11};
  config['spreadsheetStudentEditable'] = {name : "Add student edit permission to sheet", row : 12};

  config['documentEnable'] = {name : "Also create student documents", row : 14};
  config['documentTemplate'] = {name : "Key for document template", row : 15};
  config['documentSuffix'] = {name : "Suffix for document titles", row : 16};
  config['documentPublic'] = {name : "Make documents viewable by anyone (not used)", row : 17};
  config['documentViewable'] = {name : "Add student view permission to document", row : 18};
  config['documentCommentable'] = {name : "Add student comment permission to document (not used)", row : 19};
  config['documentEditable'] = {name : "Add student edit permission to document", row : 20};

  return config;
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
        return false;
      }
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
        return false;
      }
      return document;
    }

    // No specific type of file should be returned – just return that this row should be updated.
    return true;
  }
  // Not marked for update.
  return false;
}

/**
 * Returns the config for a given entry, as set on the config tab.
 */
function studentMatrixGetConfig(entry) {
  var config = studentMatrixConfig();
  var row = config[entry]['row'];
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config").getRange(row, 2).getValue();
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
  configSheet.getRange(1, 1).setValue("Setting");
  configSheet.getRange(1, 2).setValue("Value");
  // Set the names of the settings.
  var config = studentMatrixConfig();
  for (var entry in config) {
    configSheet.getRange(config[entry]["row"], 1).setValue(config[entry]["name"]);
  }

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
  studentSheet.setFrozenRows(1);
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
        newSheet.addEditor(editorMails);
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
          newDocument.addEditors(editorMails);
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
      }
    }
  }
}

/**
 * Adds a new sheet, cloned from the template specified in the settings.
 */
function studentMatrixAddTemplateSheet() {
  SpreadsheetApp.openById(studentMatrixGetConfig("spreadsheetTemplate")).getSheetByName(studentMatrixGetConfig("spreadsheetTab")).copyTo(SpreadsheetApp.getActiveSpreadsheet());
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
 * Update colors in student sheets according to a reference sheet.
 */
function updateStudentSheets() {
  // Get some data from the settings tab.
  var infoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var mainSheetName = infoSheet.getRange(2, 2).getValue();
  var colorUntested = infoSheet.getRange(4, 2).getBackgroundColor();
  var colorUnlocked = infoSheet.getRange(5, 2).getBackgroundColor();
  var colorOk = infoSheet.getRange(6, 2).getBackgroundColor();
  var colorCritical = infoSheet.getRange(7, 2).getBackgroundColor();

  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (templateSheet.getName() == "Settings" || templateSheet.getName() == "Students") {
    Browser.msgBox("Cannot use Settings or Student sheets as templates.");
    return;
  }
  var cells = SpreadsheetApp.getActiveRange();

  // Get the student sheets and start processing them.
  var studentInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");

  // Update each of the target sheets.
  for (var studentRow = 2; studentRow <= studentInfo.getLastRow(); studentRow++) {
    // Skip the update if a flag is set to skip.
    if (studentInfo.getRange(studentRow, 3).getValue() == "update") {
      // For debugging/tracking: print out the student name.
//      Browser.msgBox("Updating matrix for " + studentInfo.getRange(studentRow, 1).getValue() + ".");

      // Get the target spreadsheet to update.
      var targetSheet = SpreadsheetApp.openById(studentInfo.getRange(studentRow, 4).getValue()).getSheetByName(mainSheetName);

      // Crawl through the selection in the template sheet and find cells that should be updated in the target sheet.
      for (var row = cells.getRow(); row <= cells.getLastRow(); row++) {
        for (var column = cells.getColumn(); column <= cells.getLastColumn(); column++) {
          // Load the background color for the source cell. We need to compensate row and column numbers, since we only search in the active selection.
          var thisCellColor = cells.getCell(row - cells.getRow() + 1, column - cells.getColumn() + 1).getBackgroundColor();
          // We don't want to automatically approve cells, only unlock them.
          if (thisCellColor == colorOk) {
            thisCellColor = colorUnlocked;
          }
          if (thisCellColor == colorUnlocked || thisCellColor == colorCritical || thisCellColor == colorOk) {
            var targetCellColor = targetSheet.getRange(row, column).getBackgroundColor();
            if (targetCellColor != colorOk) {
              targetSheet.getRange(row, column).setBackgroundColor(thisCellColor);
            }
          }
        }
      }
    }
  }

  return;
};

/**
 * Change the color of the selected cell, in all student sheets.
 */
function updateCellColor() {
  // Get some data from the settings tab.
  var infoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var mainSheetName = infoSheet.getRange(2, 2).getValue();

  // Load the active sheet, used for reference, and make sure it not one of the special sheets.
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (templateSheet.getName() == "Settings" || templateSheet.getName() == "Students") {
    Browser.msgBox("Cannot use Settings or Student sheets as templates.");
    return;
  }
  var cells = SpreadsheetApp.getActiveRange();

  // Get the student sheets and start processing them.
  var studentInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");

  // Update each of the target sheets.
  for (var studentRow = 2; studentRow <= studentInfo.getLastRow(); studentRow++) {
    // Only update if the flag is set to 'update'.
    if (studentInfo.getRange(studentRow, 3).getValue() == "update") {
      // For debugging/tracking: print out the student name.
//      Browser.msgBox("Updating matrix for " + studentInfo.getRange(studentRow, 1).getValue() + ".");

      // Get the target spreadsheet to update.
      var targetSheet = SpreadsheetApp.openById(studentInfo.getRange(studentRow, 4).getValue()).getSheetByName(mainSheetName);
      targetSheet.getRange(cells.getRow(), cells.getColumn(), cells.getNumRows(), cells.getNumColumns()).setBackgroundColors(cells.getBackgrounds());
    }
  }

  return;
};
