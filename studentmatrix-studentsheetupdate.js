/**
* @file
* StudentActions for some basic updates of student sheets.
*/

StudentMatrix.plugins.studentSheetUpdates = {
  name : 'Student sheet updates',
  description : 'Provides actions and some settings for updating student sheets.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-studentsheetupdate.js',
  dependencies : {
    core : '1.0',
    modules : {
      studentActions : '1.0',
    },
    plugins : {
      matrixtemplate : '1.0',
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
        options.colors = StudentMatrix.getProperty('assessmentColors').split('\n');
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
  },
};
