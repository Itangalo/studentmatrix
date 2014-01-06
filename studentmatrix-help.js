/**
 * @file
 * Help page for StudentMatrix.
 */

StudentMatrix.plugins.help = {
  name : 'Help pages',
  description : 'Adds a help page or two to the menu',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-help.js',
  cell : 'D10',
  dependencies : {
    core : '3.2',
    modules : {
      infopages : '1.0',
    },
  },

  menuEntries : {
    help_bar : {
      weight : 40,
    },
    help : {
      name : 'Help',
      weight : 41,
    },
    helpBeta : {
      name : 'Info for beta testers',
      weight : 42,
    },
    about : {
      name : 'About StudentMatrix',
      weight : 42,
    },
  },

  infoPages : {
    help : {
      title : 'Help: basics',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('StudentMatrix is a tool for making it easier to digitally manage student data. With StudentMatrix you can select a number of students, and do things like send customized e-mail, share files, or create and update spreadsheets with assessment information.<br /><br />'));
        container.add(app.createHTML('The actions you can do on your student list are found under the menu entry "Student actions". Each action has a short description, and sometimes a link to a help page.<br /><br />'));
        container.add(app.createHTML('By installing more plugins, you can do more actions (and some plugins extend StudentMatrix in other ways).<br /><br />'));
        container.add(app.createHTML('<br /><br />'));
      },
    },
    helpBeta : {
      title : 'Info for beta testers',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('If you\'re using StudentMatrix as a beta tester, this feedback is particularly appreciated:<br /><br />'));
        container.add(app.createHTML('* Confusing user interface (and how it can be more clear)<br /><br />'));
        container.add(app.createHTML('* How workflow can be simplified<br /><br />'));
        container.add(app.createHTML('* Actions you would like to see<br /><br />'));
        container.add(app.createHTML('You can send feedback to johan@vaxjonexus.com, or even better, start an issue at the StudentMatrix project page on GitHub.<br /><br />'));
        container.add(app.createAnchor('StudentMatrix project page on GitHub', 'https://github.com/Itangalo/studentmatrix'));
      },
    },
    about : {
      title : 'About StudentMatrix',
      content : function(container) {
        var app = UiApp.getActiveApplication();
        container.add(app.createHTML('StudentMatrix is published under GNU General Public License, version 3 (GPL-3.0). You are free to use, study, share and improve. See license details at http://www.opensource.org/licenses/gpl-3.0.html<br /><br />'));
        container.add(app.createHTML('It is possible to write new plugins for StudentMatrix, to allow more actions (and other functionality). Best starting point for this is the API documentation, and the video guides. API documentation can be found at https://github.com/Itangalo/studentmatrix/blob/3.x/studentmatrix-api.js.<br /><br />'));
        container.add(app.createHTML('StudentMatrix core is maintained by Johan Falk, a math and physics teacher in Stockholm, Sweden. Feel free to contact me at johan@vaxjonexus.com with feedback and ideas. Co-developers are very welcome.<br /><br />'));
        container.add(app.createAnchor('StudentMatrix project page on GitHub', 'https://github.com/Itangalo/studentmatrix'));
      },
    },
  },
};

function StudentMatrixMenu_help() {
  StudentMatrix.modules.infopages.showPage('help');
}

function StudentMatrixMenu_helpBeta() {
  StudentMatrix.modules.infopages.showPage('helpBeta');
}

function StudentMatrixMenu_about() {
  StudentMatrix.modules.infopages.showPage('about');
}
