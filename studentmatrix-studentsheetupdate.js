/**
* @file
* StudentActions for some basic updates of student sheets.
*/

StudentMatrix.plugins.studentSheetUpdates = {
  name : 'Student sheet updates',
  description : 'Provides actions and some settings for updating student sheets.',
  version : '1.2',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-studentsheetupdate.js',
  cell : 'D5',
  dependencies : {
    core : '3.0',
    modules : {
      core : '1.4',
      studentActions : '1.0',
    },
    plugins : {
      matrixtemplate : '1.3',
    },
  },

  studentActions : {
    pushColor : {
      name : 'Update colors in student sheets',
      group : 'Update student sheets',
      description : 'Uses the current selection in a push sheet to set colors in student sheets. Changes will be pushed to the tab "' + StudentMatrix.plugins.matrixtemplate.getTargetSheetName() + '".',

      processor : function(row, options) {
        var targetRange = StudentMatrix.components.fetchers.studentRange(row, options.targetTab, options.currentSelection.getA1Notation());
        var targetBackgrounds = targetRange.getBackgrounds();
        var sourceBackgrounds = options.currentSelection.getBackgrounds();

        // Process each background color in the target sheet, depending on the options.
        for (var r in sourceBackgrounds) {
          for (var c in sourceBackgrounds[r]) {
            // If we only should update cells with signal colors, and the current cell doesn't have a
            // signal color, copy the target to the source to avoid changing any values.
            if (options.onlyMarked == 'true' && options.colors.indexOf(sourceBackgrounds[r][c]) == -1) {
              sourceBackgrounds[r][c] = targetBackgrounds[r][c];
            }

            // Check the mode of raiseOrLower, and if necessary compare the colors in source and target.
            if (options.raiseOrLower == '') {
              targetBackgrounds[r][c] = sourceBackgrounds[r][c];
            }
            else if (options.raiseOrLower == 'onlyRaise' && options.colors.indexOf(sourceBackgrounds[r][c]) > options.colors.indexOf(targetBackgrounds[r][c])) {
              targetBackgrounds[r][c] = sourceBackgrounds[r][c];
            }
            else if (options.raiseOrLower == 'onlyLower' && options.colors.indexOf(sourceBackgrounds[r][c]) < options.colors.indexOf(targetBackgrounds[r][c])) {
              targetBackgrounds[r][c] = sourceBackgrounds[r][c];
            }
          }
        }
        targetRange.setBackgrounds(targetBackgrounds);
      },
      validator : function() {
        if (StudentMatrix.plugins.matrixtemplate.getTargetSheetName() == false) {
          return 'The active sheet is not connected to any tab in the matrix template. Updates cannot be pushed.';
        }
      },

      options : {
        onlyMarked : true,
        raiseOrLower : '',
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        var onlyMarked = app.createCheckBox('Only update cells with signal colors in the push sheet.').setName('onlyMarked');
        container.add(onlyMarked);
        handler.addCallbackElement(onlyMarked);

        var raiseOrLower = app.createListBox().setName('raiseOrLower');
        raiseOrLower.addItem('Don\'t mind the existing cell colors in the student sheets.', '');
        raiseOrLower.addItem('Don\'t lower any cell colors in student sheets.', 'onlyRaise');
        raiseOrLower.addItem('Don\'t raise any cell colors in student sheets.', 'onlyLower');
        container.add(raiseOrLower);
        handler.addCallbackElement(raiseOrLower);
      },
      optionsProcessor : function(eventInfo) {
        var options = {};
        options.onlyMarked = eventInfo.parameter.onlyMarked;
        options.raiseOrLower = eventInfo.parameter.raiseOrLower;
        options.currentSelection = SpreadsheetApp.getActiveRange();
        options.targetTab = StudentMatrix.plugins.matrixtemplate.getTargetSheetName();
        options.colors = StudentMatrix.getProperty('assessmentColors');
        return options;
      },
    },

    pushContent : {
      name : 'Update content in student sheets',
      group : 'Update student sheets',
      description : 'Uses the current selection in a push sheet to set content in student sheets. Changes will be pushed to the tab "' + StudentMatrix.plugins.matrixtemplate.getTargetSheetName() + '".',

      processor : function(row, options) {
        var targetRange = StudentMatrix.components.fetchers.studentRange(row, options.targetTab, options.currentSelection.getA1Notation());
        // Note: This actions is a bit complicated by the fact that formulas and static content are treated differently.
        var targetValues = targetRange.getValues();
        var sourceValues = options.currentSelection.getValues();
        var sourceFormulas = options.currentSelection.getFormulas();

        // First: Push all the static content, but keep track of all cells with formulas.
        var formulaCells = {};
        for (var r in sourceFormulas) {
          for (var c in sourceFormulas[r]) {
            if (sourceFormulas[r][c] == '') {
              targetValues[r][c] = sourceValues[r][c];
            }
            else {
              // Store the reference to row and column. The +1 shift is to load each
              // cell the right way later on, when numbering starts on 1 (not 0).
              formulaCells['-' + r + '-' + c] = {r : r, c : c};
            }
          }
        }
        targetRange.setValues(targetValues);

        // Process the cells with formulas.
        for (var exception in formulaCells) {
          r = parseInt(formulaCells[exception]['r']);
          c = parseInt(formulaCells[exception]['c']);
          if (options.replacement == 'true') {
            sourceFormulas[r][c] = sourceFormulas[r][c].replace(',', ';');
          }
          targetRange.getCell(r + 1, c + 1).setFormula(sourceFormulas[r][c]);
        }
      },
      validator : function() {
        if (StudentMatrix.plugins.matrixtemplate.getTargetSheetName() == false) {
          return 'The active sheet is not connected to any tab in the matrix template. Updates cannot be pushed.';
        }
      },

      options : {
        replacement : true,
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        var replacement = app.createCheckBox('Replace any commas in formulas with semicolons. (recommended)').setName('replacement').setValue(true);
        container.add(replacement);
        handler.addCallbackElement(replacement);
      },
      optionsProcessor : function(eventInfo) {
        var options = {};
        options.replacement = eventInfo.parameter.replacement;
        options.currentSelection = SpreadsheetApp.getActiveRange();
        options.targetTab = StudentMatrix.plugins.matrixtemplate.getTargetSheetName();
        return options;
      },
    },

    readColors : {
      name : 'Read status of selected cells',
      group : 'Update student sheets',
      description : 'Reads the values of the selected cells, to see how many are marked with specified colors. Results are displayed in the student list.',
      options : {},
      optionsBuilder : function(handler, container) {
        // There are three parts to this form.
        // One: How colors (cell status) should be compared.
        var app = UiApp.getActiveApplication();
        var operator = app.createListBox().setName('operator');
        container.add(app.createLabel('Count the number of cells that...'));
        operator.addItem('exactly match', 'equal');
        operator.addItem('are equal or above to', 'greater');
        operator.addItem('are equal or less to', 'less');
        handler.addCallbackElement(operator);
        container.add(operator);

        // Two: Which color (status) to compare against.
        var colors = StudentMatrix.getProperty('assessmentColors', null, true);
        var colorNames = StudentMatrix.getProperty('assessmentNames', null, true);
        var color = app.createListBox().setName('color');
        for (var i in colors) {
          color.addItem(colorNames[i], colors[i]);
        }
        handler.addCallbackElement(color);
        container.add(color);

        // Three: What column to write the result to.
        container.add(app.createLabel('Write the result in the following column:'));
        var columnHeaders = StudentMatrix.mainSheet().getRange('1:1').getValues()[0];
        var column = app.createListBox().setName('column');
        for (var i in columnHeaders) {
          // The index and column number are off by one, thus this correction.
          var number = parseInt(i) + 1;
          column.addItem(columnHeaders[i] + ' (' + number + ')', number);
        }
        handler.addCallbackElement(column);
        container.add(column);

        return app;
      },
      optionsProcessor : function(eventInfo) {
        var options = {};
        options.operator = eventInfo.parameter.operator;
        options.colorIndex = StudentMatrix.getProperty('assessmentColors').indexOf(eventInfo.parameter.color);
        options.colorList = StudentMatrix.getProperty('assessmentColors');
        options.currentSelection = SpreadsheetApp.getActiveRange();
        options.targetTab = StudentMatrix.plugins.matrixtemplate.getTargetSheetName();
        options.column = eventInfo.parameter.column;
        return options;
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

      processor : function(row, options) {
        var targetRange = StudentMatrix.components.fetchers.studentRange(row, options.targetTab, options.currentSelection.getA1Notation());
        var backgrounds = targetRange.getBackgrounds();
        // Loop through the backgrounds, and count the matches.
        var count = 0;
        for (var i in backgrounds) {
          for (var j in backgrounds[i]) {
            var colorIndex = options.colorList.indexOf(backgrounds[i][j]);
            // Easist case: Target cell doesn't match any of the listed colors.
            if (colorIndex == -1) {
            }
            // Next easiest case: Target cell is equal to the selected color.
            else if (colorIndex == options.colorIndex) {
              count++;
            }
            // Other cases: We have a greater/lesser than match.
            else if (colorIndex > options.colorIndex && options.operator == 'greater') {
              count++;
            }
            else if (colorIndex < options.colorIndex && options.operator == 'less') {
              count++;
            }
          }
        }
        // Write the count to the relevant column in the main sheet.
        StudentMatrix.mainSheet().getRange(row, options.column).setValue(count);
      }
    },
  },
};
