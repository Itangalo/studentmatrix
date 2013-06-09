/**
 * Returns the config for a given entry, as set on the config tab.
 */
function studentMatrixGetConfig(entry) {
  var result = ScriptProperties.getProperty(entry);
  if (typeof result == 'undefined') {
    return studentMatrixConfig()[entry]['fallback'];
  }
  return result;
}

/**
 * Creates a popup panel for managing settings for StudentMatrix.
 */
function studentMatrixSettings() {
  // Create the panel, a wrapper and a save button.
  var app = UiApp.createApplication().setTitle("StudentMatrix settings (" + studentMatrixVersion() + ")");
  var outerPanel = app.createVerticalPanel().setWidth("100%").setHeight("100%");
  app.add(outerPanel);

  var tabPanel = app.createDecoratedTabPanel().setId('tabPanel').setWidth("100%").setHeight("100%");
  outerPanel.add(tabPanel);

  // Add a handler that will react and save values when the save button is clicked.
  var handler = app.createServerHandler("studentMatrixConfigSave");
  outerPanel.add(app.createButton("Save").addClickHandler(handler));

  // Get the configuration and start building the config panel.
  var settings = studentMatrixConfig();

  // First we need to check how many rows we should have in each sub panel.
  var grid = [];
  for (var i in settings) {
    if (typeof grid[settings[i]['parent']] == 'undefined') {
      grid[settings[i]['parent']] = 1;
    }
    else {
      grid[settings[i]['parent']]++;
    }
    if (settings[i]['type'] == 'hidden') {
      grid[settings[i]['parent']]--;
    }
  }

  // Create the sub panels, and a grid for each sub panel. Also initiate a counter
  // for each grid, to keep track of the rows.
  var row = [];
  for (var i in grid) {
    grid[i] = app.createGrid(grid[i], 3);
    tabPanel.add(app.createScrollPanel(grid[i]).setWidth("100%").setHeight("200px"), i);
    row[i] = 0;
  }

  // Build config elements to put in the grid.
  var elements = [];

  for (var i in settings) {
    // The default behaviour is a standard textbox, but there are some others as well.
    switch (settings[i]['type']) {
      case 'checkbox':
        elements[i] = app.createCheckBox().setValue(studentMatrixGetConfig(i) == 'true');
        break;
      case 'markup':
        grid[settings[i]['parent']]
          .setText(row[settings[i]['parent']], 1, settings[i]["fallback"]);
        row[settings[i]['parent']]++;
        continue;
      case 'hidden':
        continue;
      default:
        elements[i] = app.createTextBox().setText(studentMatrixGetConfig(i));
    }
    // Some special flags on the config items should be treated differently.
    if (settings[i]['special'] == 'disabled' || settings[i]['type'] == 'markup') {
      elements[i].setEnabled(false);
    }
    if (settings[i]['special'] == 'glink' && studentMatrixGetConfig(i) != '') {
      try {
        grid[settings[i]['parent']]
        .setWidget(row[settings[i]['parent']], 2, app.createAnchor('link', true, DocsList.getFileById(studentMatrixGetConfig(i)).getUrl()));
      }
      catch (e) {
      }
    }

    // Each elementshould have ID, name and description before being added to the grid.
    elements[i].setId(i).setName(i).setTitle(settings[i]['description']);
    grid[settings[i]['parent']]
      .setText(row[settings[i]['parent']], 1, settings[i]["name"])
      .setWidget(row[settings[i]['parent']], 0, elements[i]);
    handler.addCallbackElement(elements[i]);
    row[settings[i]['parent']]++;
  }

  // Display the panel. Also, the UI app is returned to allow processing by Google Apps Script.
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.show(app);

  return app;
}

/**
 * Handler for saving configuration from the config panel popup.
 */
function studentMatrixConfigSave(eventInfo) {
  // Save all configuration options, display a toaster message, and close the panel.
  ScriptProperties.setProperties(eventInfo.parameter);
  SpreadsheetApp.getActiveSpreadsheet().toast("", "Configuration saved.", 1);
  var app = UiApp.getActiveApplication();
  app.close();
  return app;
}

/**
 * Declares the settings used by StudentMatrix.
 */
function studentMatrixConfig() {
  var config = [];
  // Global settings.
  config['resetUpdateColumn'] = {
    parent : 'Global',
    name : "Reset update flag after update",
    description : "Check to change update column to datestamp when finished.",
    fallback : 0,
    type : "checkbox",
  };
  config['editorMails'] = {
    parent : 'Global',
    name : "Emails for editors",
    description : "Must be gmail addresses. Separate with space.",
    fallback : "",
  };
  config['verboseCreation'] = {
    parent : 'Global',
    name : "Alert for each new file created",
    description : "Check to get a popup box confirming each new created file.",
    fallback : 0,
    type : "checkbox",
  };
  config['folder'] = {
    parent : 'Global',
    name : "Folder to use for this class",
    description : "All files created by this master sheet will be placed in this folder.",
    fallback : "class folder",
    special : 'glink',
  };
  config['emailTemplate'] = {
    parent : 'Global',
    name : "Key for e-mail template",
    description : "The key for the Google document used when sending out e-mail notifications. Found in document URL.",
    fallback : '1tbY8JzstY3Yt2ih78ArRkgz-PvATXAI8OFcU7aGGLCg',
    special : 'glink',
  };

  // Settings for spreadsheets.
  config['spreadsheetTemplate'] = {
    parent : 'Spreadsheet',
    name : "Key for spreadsheet template",
    description : "The key for the spreadsheet copied when creating new student sheets. Found in sheet URL.",
    fallback : 'tuOKaCiGtKKo7tyi57YtR9A',
    special : 'glink',
  };
  config['spreadsheetTab'] = {
    parent : 'Spreadsheet',
    name : "Name of tab with matrix",
    description : "The name of the tab containing the actual matrix. Case sensitive.",
    fallback : 'Sheet1',
  };
  config['spreadsheetSuffix'] = {
    parent : 'Spreadsheet',
    name : "Suffix for spreadsheet titles",
    description : "Anything added here will be appended to the student name when creating spreadsheet titles.",
    fallback : ' (matrix)',
  };
  config['spreadsheetColorUnlocked'] = {
    parent : 'Spreadsheet',
    name : "Color for unlocked matrix cells",
    description : "Set background color on this cell to the one you wish to use for unlocked cells which are not yet approved.",
    fallback : '#ff0000',
    special : "read from background"
  };
  config['spreadsheetColorOk'] = {
    parent : 'Spreadsheet',
    name : "Color for approved matrix cells",
    description : "Set background color on this cell to the one you wish to use for approved cells.",
    fallback : '#00ff00',
    special : "read from background"
  };
  config['spreadsheetColorReview'] = {
    parent : 'Spreadsheet',
    name : "Color for cells in need of review",
    description : "Set background color on this cell to the one you wish to use for cells that have been conquered, but then lost.",
    fallback : '#ffff00',
    special : "read from background"
  };
  config['spreadsheetPublic'] = {
    parent : 'Spreadsheet',
    name : "Make new spreadsheets viewable by anyone",
    description : "Check to make new spreadsheets accessible for anyone.",
    fallback : 'true',
    type : "checkbox",
  };
  config['spreadsheetStudentViewable'] = {
    parent : 'Spreadsheet',
    name : "Add student view permission to new sheets",
    description : "Check to add the student email to list of users with view access. Requires gmail address.",
    fallback : 0,
    type : "checkbox",

  };
  config['spreadsheetStudentEditable'] = {
    parent : 'Spreadsheet',
    name : "Add student edit permission to new sheets",
    description : "Check to add the student email to list of users with edit access. Requires gmail address.",
    fallback : 0,
    type : "checkbox",
  };

  // Settings for documents.
  config['documentEnable'] = {
    parent : 'Document',
    name : "Also create student documents",
    description : "Check to have StudentMatrix also create a Google document for each student, not only spreadsheets.",
    fallback : 0,
    type : "checkbox",
  };
  config['documentTemplate'] = {
    parent : 'Document',
    name : "Key for document template",
    description : "The key for the document to copy to each student. Key is found in the document URL.",
    fallback : 0,
    special : 'glink',
  };
  config['documentSuffix'] = {
    parent : 'Document',
    name : "Suffix for document titles",
    description : "Anything added here will be appended to the student name when creating title for the document.",
    fallback : ' (feedback)',
  };
  config['documentPublic'] = {
    parent : 'Document',
    name : "Make documents viewable by anyone (not used)",
    description : "There are not yet API functions for Google documents to allow this. Sorry.",
    fallback : 1,
    type : "checkbox",
    special : 'disabled',
  };
  config['documentViewable'] = {
    parent : 'Document',
    name : "Add student view permission to document",
    description : "Check to add the student email to the list of users allowed to view new documents. Requires gmail address.",
    fallback : 0,
    type : "checkbox",
  };
  config['documentCommentable'] = {
    parent : 'Document',
    name : "Add student comment permission to document (not used)",
    description : "There are not yet API functions for Google documents to allow this. Sorry.",
    fallback : 0,
    type : "checkbox",
    special : 'disabled',
  };
  config['documentEditable'] = {
    parent : 'Document',
    name : "Add student edit permission to document",
    description : "Check to add the student email to the list of users allowed to edit new documents. Requires gmail address.",
    fallback : 0,
    type : "checkbox",
  };

  // Settings for Khan Academy stuff.
  config['KhanConsumerKey'] = {
    parent : 'Khan Academy',
    name : "Khan Academy API consumer key",
    description : '',
    fallback : '',
  };
  config['KhanConsumerSecret'] = {
    parent : 'Khan Academy',
    name : "Khan Academy API secret",
    description : '',
    fallback : '',
  };
  config['KhanToken'] = {
    parent : 'Khan Academy',
    name : "Khan Academy API token",
    description : '',
    fallback : '',
  };
  config['KhanTokenSecret'] = {
    parent : 'Khan Academy',
    name : "Khan Academy API token secret",
    description : '',
    fallback : '',
  };
  config['KhanTokenHelp1'] = {
    parent : 'Khan Academy',
    type : 'markup',
    fallback : 'Video showing how to get keys: http://www.youtube.com/watch?v=eyWsrfZQh5g',
  };
  config['KhanTokenHelp2'] = {
    parent : 'Khan Academy',
    type : 'markup',
    fallback : 'Step 1: Register for Khan Academy API keys here: https://www.khanacademy.org/api-apps/register',
  };
  config['KhanTokenHelp3'] = {
    parent : 'Khan Academy',
    type : 'markup',
    fallback : 'Step 2: Online service for generating access keys: http://developer.netflix.com/resources/OAuthTest (use URL https://www.khanacademy.org/api/auth/request_token )',
  };
  config['KhanTokenHelp4'] = {
    parent : 'Khan Academy',
    type : 'markup',
    fallback : 'Step 3: Use generated keys at http://developer.netflix.com/resources/OAuthTest to get final keys. (Use URL https://www.khanacademy.org/api/auth/access_token .)',
  };

  // Settings for version updates.
  config['version'] = {
    parent : 'Global',
    name : "Configuration version",
    type : 'hidden',
    description : '',
    fallback : studentMatrixVersion(),
  };

  return config;
}
