/**
 * @file
 * Module that allows custom menu entries for StudentMatrix.
 */

/**
 * Module for handling StudentMatrix menu entries.
 */
StudentMatrix.modules.menu = function() {
  // Reads entries in the StudentMatrixMenu property and builds a menu for them.
  function buildMenuEntries() {
    // Get default entries defined in code, and combine with entries stored in properties.
    var defaultEntries = StudentMatrix.getPluginAndModuleProperties('menuEntries');
    var customEntries = StudentMatrix.getProperty('StudentMatrixMenu');
    for (var entry in defaultEntries) {
      if (customEntries[entry] == undefined) {
        customEntries[entry] = defaultEntries[entry];
      }
    }

    // Sort the entries by weight.
    var sortable = [];
    for (var entry in customEntries) {
      sortable.push([entry, customEntries[entry].weight]);
    }
    sortable.sort(function(a, b) {return a[1] - b[1]});

    // Build the final menu entry list.
    var menuEntries = [];
    for (var i in sortable) {
      if (customEntries[sortable[i][0]].disabled != true) {
        if (customEntries[sortable[i][0]].name == undefined || customEntries[sortable[i][0]].name == null) {
          menuEntries.push(null);
        }
        else {
          menuEntries.push({name : customEntries[sortable[i][0]].name, functionName : 'StudentMatrixMenu_' + sortable[i][0]});
        }
      }
    }

    SpreadsheetApp.getActiveSpreadsheet().addMenu('StudentMatrix ' + StudentMatrix.versionName, menuEntries);
  };

  // Wrapper function to fetch and call a menu callback item.
  function callMenuItem(menuItemID) {
    var menuItem = StudentMatrix.getProperty('StudentMatrixMenu', menuItemID.toString());
    if (menuItem != null && menuItem.callback != undefined) {
      StudentMatrix.callRecursive(menuItem.callback, menuItem.arguments);
    }
  };

  // Adds a new menu entry to StudentMatrixMenu, or replaces an existing one.
  function setMenuEntry(callback, label, weight, menuItemID) {
    // If no menu item ID is specified, see if there is a free one.
    if (menuItemID == undefined) {
      // Find the lowest unused entry in the span 1--7.
      var entries = StudentMatrix.getProperty('StudentMatrixMenu') || {};
      for (i = 7; i >= 1; i--) {
        if (entries[i.toString()] == undefined) {
          menuItemID = i.toString();
        }
      }
    }
    if (menuItemID == undefined) {
      StudentMatrix.toast('All custom menu places filled. Cannot add more.');
      return;
    }
    if (typeof menuItemID != 'string') {
      StudentMatrix.toast('Cannot set menu entry: Menu item ID must be a string.');
      return;
    }

    // Build an entry and store it, then rebuild the menu.
    var entry = {
      callback : callback,
      name : label,
      weight : weight,
    };
    StudentMatrix.setProperty(entry, 'StudentMatrixMenu', menuItemID);
    StudentMatrix.modules.menu.buildMenuEntries();
  };

  function removeMenuEntry(menuItemID) {
    var entries = StudentMatrix.deleteProperty('StudentMatrixMenu', menuItemID);
    StudentMatrix.modules.menu.buildMenuEntries();
  };

  function resetMenu() {
    var menuEntries = StudentMatrix.getPluginAndModuleProperties('menuEntries');
    StudentMatrix.setProperty(menuEntries, 'StudentMatrixMenu');
    this.buildMenuEntries();
  };

  // Reveal public functions and properties.
  return {
    name : 'Menu',
    description : 'Allows customizing menu entries for StudentMatrix.',
    version : '1.3',
    required : true,
    updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-menu.js',
    cell : 'D8',
    dependencies : {
      core : '3.2',
    },
    buildMenuEntries : buildMenuEntries,
    callMenuItem : callMenuItem,
    setMenuEntry : setMenuEntry,
    removeMenuEntry : removeMenuEntry,
    resetMenu : resetMenu,
  };
}();

// A number of global functions, to make the menus work with Google API.
// The point of the functions is to call the appropriate callback stored in the
// StudentMatrix property 'StudentMatrixMenu'.

function StudentMatrixMenu_1() {
  StudentMatrix.modules.menu.callMenuItem('1');
}

function StudentMatrixMenu_2() {
  StudentMatrix.modules.menu.callMenuItem('2');
}

function StudentMatrixMenu_3() {
  StudentMatrix.modules.menu.callMenuItem('3');
}

function StudentMatrixMenu_4() {
  StudentMatrix.modules.menu.callMenuItem('4');
}

function StudentMatrixMenu_5() {
  StudentMatrix.modules.menu.callMenuItem('5');
}

function StudentMatrixMenu_6() {
  StudentMatrix.modules.menu.callMenuItem('6');
}

function StudentMatrixMenu_7() {
  StudentMatrix.modules.menu.callMenuItem('7');
}
