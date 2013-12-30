/**
 * @file
 * Menu entries for step-by-step set up of StudentMatrix.
 */

StudentMatrix.plugins.installwizard = {
  name : 'Installation wizard',
  description : 'Adds menu entries for step by step installation.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-installwizard.js',
  cell : 'D9',
  dependencies : {
    core : '3.2',
    modules : {
      settings : '1.0',
      menu : '1.2',
    },
  },
  
  menuEntries : {
    install1 : {
      name : 'Step 1: Choose plugins and modules',
      weight : -7,
    },
    installBreak : {
      name : null,
      weight : -1,
    }
  },
  
  infoPages : {
    install1 : {
      title : 'Step 1: Choose plugins and modules',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('StudentMatrix is a tool for making it easier to digitally manage student data. With StudentMatrix you can select a number of students, and do things like send customized e-mail, share files, or create and update spreadsheets with assessment information.<br /><br />'));
        container.add(app.createHTML('What you can and cannot do with your students depend on which plugins you have enabled. First step is to choose which plugins you want to use.<br /><br />'));
        container.add(app.createHTML('(If the settings are confusing, you can just leave all plugins on, and change them later on from the settings menu.)<br /><br />'));
      },
      doneText : 'Show the list of plugins',
      afterProcess : function() {
        StudentMatrix.setProperty(StudentMatrix.plugins.installwizard.menuEntries.install1, 'StudentMatrixMenu', 'install1');
        var entry = {
          callback : 'modules.infopages.showPage',
          arguments : ['install2'],
          name : 'Step 2: Set up columns',
          weight : -5,
        };
        StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'install2');
        StudentMatrix.modules.menu.buildMenuEntries();
        StudentMatrix.modules.settings.showSettings(null, 'Plugin and module management');
      },
    },
    install2 : {
      title : 'Step 2: Set up columns',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('StudentMatrix will be reading data from a list of students that you enter in the spreadsheet. Depending on what plugins you are using, different columns will be used to read and write data about the students.<br /><br />'));
        container.add(app.createHTML('You can change the name of the columns if you like, and you can your own columns with data too.<br /><br />'));
        container.add(app.createHTML('If you want to see which columns are used by plugins, or change which are being used, visit the settings. (You can also change what tab is used to read your student list, if you like.)<br /><br />'));
      },
      doneText : 'Create the necessary columns',
      afterProcess : function() {
        var entry = {
          callback : 'modules.infopages.showPage',
          arguments : ['install3'],
          name : 'Step 3: Add students',
          weight : -3,
        };
        StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'install3');
        StudentMatrix.modules.menu.buildMenuEntries();

        StudentMatrix.setUpColumns();
      },
    },
    install3 : {
      title : 'Step 3: Add your students',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('All right! All the difficult parts are done. Before you start working with StudentMatrix, though, you need to add a list of students.<br /><br />'));
        container.add(app.createHTML('Add names in the names column, and e-mail addresses in the column for that.<br /><br />'));
        container.add(app.createHTML('Hint 1: Many StudentMatrix plugins assume that the e-mail address is a Google account.<br /><br />'));
        container.add(app.createHTML('Hint 2: The "process" column is used to mark which students should or should not be processed, when you perform actions on the student rows. If you get tired of clicking check boxes in the student actions settings, you can just enter 1 in rows that should be processed instead.<br /><br />'));
      },
      doneText : 'Got it! Let me add my students.',
      afterProcess : function() {
        var entry = {
          callback : 'modules.infopages.showPage',
          arguments : ['install4'],
          name : 'Step 4: Check the settings',
          weight : -3,
        };
        StudentMatrix.setProperty(entry, 'StudentMatrixMenu', 'install4');
        StudentMatrix.modules.menu.buildMenuEntries();

        StudentMatrix.setUpColumns();
      },
    },
    install4 : {
      title : 'Step 4: Check the settings',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('That\'s it! But before you start working with StudentMatrix, it makes sense to have a look at the settings. For example:<br /><br />'));
        container.add(app.createHTML('* If you want to use StudentMatrix for spreadsheets with assessment information, you have to specify a spreadsheet template. Check the "student sheet setup" settings for this.<br /><br />'));
        container.add(app.createHTML('* <br /><br />'));
      },
      doneText : 'Show me the settings',
      afterProcess : function() {
        StudentMatrix.modules.settings.settingsDialog();
      },
    },
  },
};

function StudentMatrixMenu_install1() {
  StudentMatrix.modules.infopages.showPage('install1');
}

function StudentMatrixMenu_install2() {
  StudentMatrix.modules.menu.callMenuItem('install2');
}

function StudentMatrixMenu_install3() {
  StudentMatrix.modules.menu.callMenuItem('install3');
}

function StudentMatrixMenu_install4() {
  StudentMatrix.modules.menu.callMenuItem('install4');
}
