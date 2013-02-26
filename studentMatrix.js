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
  Browser.msgBox(studentMatrixGetConfig("spreadsheetTemplate"));
  var sheet = studentMatrixGetStudentSheet(2);
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

  config['spreadsheetTemplate'] = {name : "Key for spreadsheet template", row : 4};
  config['spreadsheetTab'] = {name : "Name of tab with matrix", row : 5};
  config['spreadsheetSuffix'] = {name : "Suffix for spreadsheet titles", row : 6};
  config['spreadsheetColorUnlocked'] = {name : "Color for unlocked matrix cells", row : 7};
  config['spreadsheetColorOk'] = {name : "Color for approved matrix cells", row : 8};
  config['spreadsheetPublic'] = {name : "Make spreadsheets viewable by anyone", row : 9};
  config['spreadsheetStudentViewable'] = {name : "Add student view permission to sheet", row : 10};
  config['spreadsheetStudentEditable'] = {name : "Add student edit permission to sheet", row : 11};

  config['documentEnable'] = {name : "Also create student documents", row : 13};
  config['documentTemplate'] = {name : "Key for document template", row : 14};
  config['documentSuffix'] = {name : "Suffix for document titles", row : 15};
  config['documentPublic'] = {name : "Make documents viewable by anyone", row : 16};
  config['documentViewable'] = {name : "Add student view permission to document", row : 17};
  config['documentCommentable'] = {name : "Add student comment permission to document", row : 18};
  config['documentEditable'] = {name : "Add student edit permission to document", row : 19};

  return config;
}

/**
 * Check if a student row is marked for update and, if so, return the related student sheet.
 */
function studentMatrixGetStudentSheet(row) {
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName("students").getRange(row, 1).getValue() == 1) {
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
  return false;
}

/**
 * Returns the config for a given entry, as set in the config tab.
 */
function studentMatrixGetConfig(entry) {
  var config = studentMatrixConfig();
  var row = config[entry]['row'];
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config").getRange(row, 2).getValue();
}

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
 * Adds a new sheet, cloned from the template specified in the settings.
 */
function addTemplateSheet() {
  var settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  SpreadsheetApp.openById(settings.getRange(1, 2).getValue()).getSheetByName(settings.getRange(2, 2).getValue()).copyTo(SpreadsheetApp.getActiveSpreadsheet());
}

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
 * Change the content of the selected cell, in all student sheets.
 */
function updateCellContent() {
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
      if (cells.getFormula() != "") {
        targetSheet.getRange(cells.getRow(), cells.getColumn(), 1, 1).setFormula(cells.getFormula());
      }
      else {
        targetSheet.getRange(cells.getRow(), cells.getColumn(), 1, 1).setValue(cells.getValue());
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

/**
 * Creates new spreadsheets for students who don't already have one.
 */
function createStudentSheets() {
  var infoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Students");
  var templateSheetKey = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(1, 2).getValue();
  var templateSheets = SpreadsheetApp.openById(templateSheetKey).getSheets();
  var templateSpreadsheet = SpreadsheetApp.openById(templateSheetKey);
  var spreadsheetSuffix = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(3, 2).getValue();
  var documentTemplateKey = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(11, 2).getValue();
  var documentTemplate = DocsList.getFileById(documentTemplateKey);
  var documentSuffix = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(12, 2).getValue();
  var coeditorEmails = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(8, 2).getValue();

  // Go through all the students and make updates.
  for (var row = 2; row <= infoSheet.getLastRow(); row++) {
    // If the student doesn't have any spreadsheet yet, create one.
    if (infoSheet.getRange(row, 4).isBlank()) {
      Browser.msgBox("Creating spreadsheet for " + infoSheet.getRange(row, 1).getValue());
      var studentSheet = templateSpreadsheet.copy(infoSheet.getRange(row, 1).getValue() + spreadsheetSuffix);
      // Flag this row for force update.
      infoSheet.getRange(row, 3).setValue("1");
    }
    // We might need to load the student spreadsheet if we didn't just create it.
    else if (infoSheet.getRange(row, 3).getValue() == "1") {
      var studentSheet = SpreadsheetApp.openById(infoSheet.getRange(row, 4).getValue());
    }

    // If the student doesn't have any text document yet, create one.
    if (infoSheet.getRange(row, 7).isBlank()) {
      var studentDocument = documentTemplate.makeCopy(infoSheet.getRange(row, 1).getValue());
    }
    // We might need to load the student text document if we didn't just create it.
    else if (infoSheet.getRange(row, 3).getValue() == "1") {
      var studentDocument = DocsList.getFileById(infoSheet.getRange(row, 7).getValue());
    }
    
    // Update all the rows that need updates.
    if (infoSheet.getRange(row, 3).getValue() == "1") {

      // Make sure the student can view the spreadsheet and document
      try {
        studentSheet.addViewer(infoSheet.getRange(row, 2).getValue());
        studentDocument.addViewer(infoSheet.getRange(row, 2).getValue());
        studentSheet.addEditor(coeditorEmails);
        studentDocument.addEditor(coeditorEmails);
      }
      catch (err) {
        Browser.msgBox(err);
      }

      // Update the sheet information, in case it is missing.
      infoSheet.getRange(row, 4).setValue(studentSheet.getId());
      infoSheet.getRange(row, 5).setValue(studentSheet.getUrl());
      infoSheet.getRange(row, 7).setValue(studentDocument.getId());
      infoSheet.getRange(row, 8).setValue(studentDocument.getUrl());

      // Add short URLs for easier sharing.
      // This probably requires a Google API key. :-(
//      var shortSheetUrl = UrlShortener.newUrl().setLongUrl(studentSheet.getUrl());
//      infoSheet.getRange(row, 6).setValue(UrlShortener.Url.insert(shortSheetUrl));
      
      // This row no longer needs update.
      infoSheet.getRange(row, 3).setValue("");
    }
  }
}
