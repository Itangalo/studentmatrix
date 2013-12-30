/**
 * @file
 * Module that allows displaying of information pages. Introduces the 'infopage' component.
 */

// Declares the GlobalActions module.
StudentMatrix.modules.infopages = {
  name : 'Information pages',
  description : 'Allows displaying pages with static information, such as help pages.',
  version : '1.0',
  required : true,
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-infopages.js',
  cell : 'D9',
  dependencies : {
    core : '3.0',
    modules : {
      menu : '1.1',
    },
  },

  // Displays dialog for running globalActions. Starting point for this module.
  showPage : function(pageID) {
    // Get some essential information and store in the UI app.
    StudentMatrix.loadComponents('infoPages');
    var infoPage = StudentMatrix.components.infoPages[pageID];
    var app = UiApp.createApplication();
    var buttonHandler = StudentMatrix.addModuleHandler('infopages', 'buttonHandler');
    var hidden = app.createHidden('pageID', pageID);
    buttonHandler.addCallbackElement(hidden);

    // Build a panel showing the information page. Scrolling might be necessary.
    if (typeof infoPage.title == 'string') {
      app.setTitle(infoPage.title);
    }
    var panel = app.createVerticalPanel();
    var wrapper = app.createScrollPanel(panel).setWidth('100%').setHeight('90%');
    app.add(wrapper);
    // The actual adding of content is managed by the 'content' method in the infoPage component.
    StudentMatrix.components.infoPages[pageID].content(panel);

    // Add buttons for forward/next/done, as specified by the info page.
    var buttonPanel = app.createHorizontalPanel();
    if (typeof infoPage.previous == 'string') {
      var previousButton = app.createButton('Previous', buttonHandler).setId('previousButton');
      buttonPanel.add(previousButton);
    }
    if (typeof infoPage.next == 'string') {
      var nextButton = app.createButton('Next', buttonHandler).setId('nextButton');
      buttonPanel.add(nextButton);
    }
    else {
      var doneButton = app.createButton(infoPage.doneText || 'Done', buttonHandler).setId('doneButton');
      buttonPanel.add(doneButton);
    }
    app.add(buttonPanel);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
  },

  buttonHandler : function(eventInfo) {
    var app = UiApp.getActiveApplication();
    app.close();
    StudentMatrix.loadComponents('infoPages');
    var infoPage = StudentMatrix.components.infoPages[eventInfo.parameter.pageID];

    // First: Check if there are any functions to call when going forth from this page.
    if ((eventInfo.parameter.source == 'nextButton' || eventInfo.parameter.source == 'doneButton') && typeof infoPage.afterProcess == 'function') {
      infoPage.afterProcess();
    }

    // Then: Open a new one if demanded. @TODO: Creating new dialogs before destroying
    // the old one seems to cause an alert. This should be fixed.
    if (eventInfo.parameter.source == 'nextButton') {
      this.showPage(infoPage.next);
      return app;
    }
    if (eventInfo.parameter.source == 'previousButton') {
      this.showPage(infoPage.previous);
      return app;
    }
  },
};
