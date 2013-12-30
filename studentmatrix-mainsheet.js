/**
 * @file
 * Settings for selecting main sheet and changing which columns to use.
 */

StudentMatrix.plugins.mainsheet = {
  name : 'Main sheet and column settings',
  description : 'Allows changing which sheet to read student list from, and changing/viewing which columns are used by modules and plugins.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-mainsheet.js',
  cell : 'D8',
  dependencies : {
    core : '3.2',
    modules : {
      settings : '1.0',
    },
  },

  settings : {
    mainSheetAndColumns : {
      group : 'Main sheet settings',
      options : {
        mainSheet : {},
        StudentMatrixColumns : {},
      },

      optionsBuilder : function(handler, container, defaults) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('<strong>Select sheet to use for student list</strong>'));
        var mainSheet = app.createListBox().setName('mainSheet');
        for (var sheet in SpreadsheetApp.getActiveSpreadsheet().getSheets()) {
          mainSheet.addItem(SpreadsheetApp.getActiveSpreadsheet().getSheets()[sheet].getName(), SpreadsheetApp.getActiveSpreadsheet().getSheets()[sheet].getName());
        }
        container.add(mainSheet);
        handler.addCallbackElement(mainSheet);


        container.add(app.createHTML('<strong>Columns used by StudentMatrix</strong>'));
        var columns = StudentMatrix.getColumns();
        var columnValues = StudentMatrix.getProperty('StudentMatrixColumns');

        var columnGrid = app.createGrid(Object.keys(columns).length, 2);
        var columnSelectors = {};
        var columnHeaders = StudentMatrix.mainSheet().getRange('1:1').getValues()[0];
        var row = 0;
        for (var column in columns) {
          columnGrid.setText(row, 0, columns[column]);
          columnSelectors[column] = app.createListBox().setName('column-' + column);
          columnSelectors[column].addItem('use first blank column', null);
          for (var i in columnHeaders) {
            var number = parseInt(i) + 1;
            columnSelectors[column].addItem(columnHeaders[i] + ' (' + number + ')', number);
          }
          columnSelectors[column].setSelectedIndex(parseInt(columnValues[column]));
          handler.addCallbackElement(columnSelectors[column]);

          columnGrid.setWidget(row, 1, columnSelectors[column]);

          row++;
        }
        container.add(columnGrid);
      },

      // Read and store the settings for main sheet and columns to use.
      optionsSaver : function(eventInfo) {
        // Store main sheet name, and also ID for fallback (if name should change).
        var mainSheet = eventInfo.parameter.mainSheet;
        StudentMatrix.setProperty(mainSheet, 'StudentMatrixMainSheetName');
        StudentMatrix.setProperty(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(mainSheet).getSheetId(), 'StudentMatrixMainSheetID');

        var columns = StudentMatrix.getColumns();
        var columnMapping = {};

        for (var column in columns) {
          if (eventInfo.parameter['column-' + column] != null) {
            columnMapping[column] = eventInfo.parameter['column-' + column];
          }
        }

        StudentMatrix.setProperty(columnMapping, 'StudentMatrixColumns');

        StudentMatrix.setUpColumns();
      },
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
