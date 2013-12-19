/**
* @file
* StudentActions for some basic updates of student sheets.
*/

StudentMatrix.plugins.studentSheetUpdates = {
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
  },
};
