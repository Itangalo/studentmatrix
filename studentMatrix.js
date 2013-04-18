// Written by Johan Falk, Sweden.
// Published under GNU General Public License, version 3 (GPL-3.0)
// See restrictions at http://www.opensource.org/licenses/gpl-3.0.html

function studentMatrixVersion() {
  return "1.9-beta";
}

/**
 * Display help link and version information.
 */
function studentMatrixHelp() {
  Browser.msgBox("Version " + studentMatrixVersion() + ". See https://github.com/Itangalo/studentmatrix for project information and documentation. Some Swedish video guides can be found at http://tinyurl.com/studentmatrix-videor.");
}

/**
 * Runs the onOpen scripts for adding menus also on install.
 */
function onInstall() {
  onOpen();
}

/**
 * Adds a custom menu to the active spreadsheet on opening the spreadsheet.
 */
function onOpen() {
  var menuEntries = [];
  menuEntries.push({name : "Unlock student cell colors for selection", functionName : "studentMatrixUnlock"});
  menuEntries.push({name : "Degrade selected cells to review status", functionName : "studentMatrixReview"});
  menuEntries.push({name : "Mark cells ok", functionName : "studentMatrixOk"});
  menuEntries.push({name : "Mark cells ok, unless marked for review", functionName : "studentMatrixSoftOk"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Set colors of student cells", functionName : "studentMatrixSetColor"});
  menuEntries.push({name : "Set content of student cells", functionName : "studentMatrixSetContent"});
  menuEntries.push({name : "Add new template sheet", functionName : "studentMatrixAddTemplateSheet"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Send notification with link(s)", functionName : "studentMatrixNotify"});
  menuEntries.push({name : "Count cell status", functionName : "studentMatrixCount"});
  menuEntries.push({name : "Create student sheets", functionName : "studentMatrixCreateStudentSheets"});
  menuEntries.push(null); // line separator
  menuEntries.push({name : "Create settings sheets", functionName : "studentMatrixCreateSettingsSheet"});
  menuEntries.push({name : "Help and version info", functionName : "studentMatrixHelp"});

  // Only add these entries if there is a sheet called "Khan exercises".
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Khan exercises").getName();
    menuEntries.push(null); // line separator
    menuEntries.push({name : "Run Khan updates", functionName : "khanUpdate"});
    menuEntries.push({name : "Update Khan goals", functionName : "khanGoals"});
  }
  catch (err) {
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu("StudentMatrix " + studentMatrixVersion(), menuEntries);
};

/**
 * Declares the settings used by StudentMatrix.
 */
function studentMatrixConfig() {
  var config = [];
  // Global settings.
  config['resetUpdateColumn'] = {
    name : "Reset update flag after update",
    description : "Set to 1 to change update column to datestamp when finished.",
    row : 2,
  };
  config['editorMails'] = {
    name : "Emails for editors",
    description : "Must be gmail addresses. Separate with space.",
    row : 3
  };
  config['verboseCreation'] = {
    name : "Alert for each new file created",
    description : "Set to 1 to get a popup box confirming each new created file.",
    row : 4
  };
  config['emailTemplate'] = {
    name : "Key for e-mail template",
    description : "The key for the Google document used when sending out e-mail notifications. Found in document URL.",
    row : 5
  };

  // Settings for spreadsheets.
  config['spreadsheetTemplate'] = {
    name : "Key for spreadsheet template",
    description : "The key for the spreadsheet copied when creating new student sheets. Found in sheet URL.",
    row : 7
  };
  config['spreadsheetTab'] = {
    name : "Name of tab with matrix",
    description : "The name of the tab containing the actual matrix. Case sensitive.",
    row : 8
  };
  config['spreadsheetSuffix'] = {
    name : "Suffix for spreadsheet titles",
    description : "Anything added here will be appended to the student name when creating spreadsheet titles.",
    row : 9
  };
  config['spreadsheetColorUnlocked'] = {
    name : "Color for unlocked matrix cells",
    description : "Set background color on this cell to the one you wish to use for unlocked cells which are not yet approved.",
    row : 10,
    special : "read from background"
  };
  config['spreadsheetColorOk'] = {
    name : "Color for approved matrix cells",
    description : "Set background color on this cell to the one you wish to use for approved cells.",
    row : 11,
    special : "read from background"
  };
  config['spreadsheetColorReview'] = {
    name : "Color for cells in need of review",
    description : "Set background color on this cell to the one you wish to use for cells that have been conquered, but then lost.",
    row : 12,
    special : "read from background"
  };
  config['spreadsheetPublic'] = {
    name : "Make spreadsheets viewable by anyone",
    description : "Set to 1 to make new spreadsheets accessible for anyone.",
    row : 13
  };
  config['spreadsheetStudentViewable'] = {
    name : "Add student view permission to sheet",
    description : "Set to 1 to add the student email to list of users with view access. Requires gmail address.",
    row : 14
  };
  config['spreadsheetStudentEditable'] = {
    name : "Add student edit permission to sheet",
    description : "Set to 1 to add the student email to list of users with edit access. Requires gmail address.",
    row : 15
  };

  // Settings for documents.
  config['documentEnable'] = {
    name : "Also create student documents",
    description : "Set to 1 to have StudentMatrix also create a Google document for each student, not only spreadsheets.",
    row : 17
  };
  config['documentTemplate'] = {
    name : "Key for document template",
    description : "The key for the document to copy to each student. Key is found in the document URL.",
    row : 18
  };
  config['documentSuffix'] = {
    name : "Suffix for document titles",
    description : "Anything added here will be appended to the student name when creating title for the document.",
    row : 19
  };
  config['documentPublic'] = {
    name : "Make documents viewable by anyone (not used)",
    description : "There are not yet API functions for Google documents to allow this. Sorry.",
    row : 20
  };
  config['documentViewable'] = {
    name : "Add student view permission to document",
    description : "Set to 1 to add the student email to the list of users allowed to view new documents. Requires gmail address.",
    row : 21
  };
  config['documentCommentable'] = {
    name : "Add student comment permission to document (not used)",
    description : "There are not yet API functions for Google documents to allow this. Sorry.",
    row : 22
  };
  config['documentEditable'] = {
    name : "Add student edit permission to document",
    description : "Set to 1 to add the student email to the list of users allowed to edit new documents. Requires gmail address.",
    row : 23
  };

  // Settings for Khan Academy stuff.
  config['KhanConsumerKey'] = {
    name : "Khan Academy API consumer key",
    row : 25
  };
  config['KhanConsumerSecret'] = {
    name : "Khan Academy API secret",
    row : 26
  };
  config['KhanToken'] = {
    name : "Khan Academy API token",
    row : 27
  };
  config['KhanTokenSecret'] = {
    name : "Khan Academy API token secret",
    row : 28
  };

return config;
}

/**
 * Returns the config for a given entry, as set on the config tab.
 */
function studentMatrixGetConfig(entry) {
  var config = studentMatrixConfig();
  var row = config[entry]['row'];
  if (config[entry]['special'] == "read from background") {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config").getRange(row, 2).getBackground();
  }
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("config").getRange(row, 2).getValue();
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
      }
    }
  }
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
