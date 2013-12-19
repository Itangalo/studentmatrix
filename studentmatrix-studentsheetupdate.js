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
        for (var i in sourceBackgrounds) {
          for (var j in sourceBackgrounds[i]) {
            // If we only should update cells with signal colors, and the current cell doesn't have a
            // signal color, copy the target to the source to avoid changing any values.
            if (options.onlyMarked == 'true' && options.colors.indexOf(sourceBackgrounds[i][j]) == -1) {
              sourceBackgrounds[i][j] = targetBackgrounds[i][j];
            }
    
            // Check the mode of raiseOrLower, and if necessary compare the colors in source and target.
            if (options.raiseOrLower == '') {
              targetBackgrounds[i][j] = sourceBackgrounds[i][j];
            }
            else if (options.raiseOrLower == 'onlyRaise' && options.colors.indexOf(sourceBackgrounds[i][j]) < options.colors.indexOf(targetBackgrounds[i][j])) {
              targetBackgrounds[i][j] = sourceBackgrounds[i][j];
            }
            else if (options.raiseOrLower == 'onlyLower' && options.colors.indexOf(sourceBackgrounds[i][j]) > options.colors.indexOf(targetBackgrounds[i][j])) {
              targetBackgrounds[i][j] = sourceBackgrounds[i][j];
            }
          }
        }
        targetRange.setBackgrounds(targetBackgrounds);
      },
  
      options : {
        onlyMarked : true,
        raiseOrLower : '',
        // Three expensive objects are loaded once and passed as options.
        currentSelection : SpreadsheetApp.getActiveRange(),
        targetTab : StudentMatrix.plugins.matrixtemplate.getTargetSheetName(),
        colors : StudentMatrix.getProperty('assessmentColors').split('\n'),
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
    },
  },
};
