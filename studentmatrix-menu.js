/**
 * @file
 * Module that allows custom menu entries for StudentMatrix.
 */

/**
 * Module for handling StudentMatrix menu entries.
 */
StudentMatrix.modules.menu = function() {
  // Reads entries in StudentMatrixMenu and builds menu callbacks for them.
  function buildMenuEntries() {
    var customEntries = StudentMatrix.getProperty('StudentMatrixMenu') || {};
    var sortable = [];
    for (var entry in customEntries) {
      sortable.push([entry, customEntries[entry].weight]);
    }
    sortable.sort(function(a, b) {return a[1] - b[1]});

    var menuEntries = {};
    for (var i in sortable) {
      menuEntries['StudentMatrixMenu_' + sortable[i][0]] = customEntries[sortable[i][0]].name;
    }
    return menuEntries;
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
    StudentMatrix.buildMenu();
  };

  function removeMenuEntry(menuItemID) {
    var entries = StudentMatrix.deleteProperty('StudentMatrixMenu', menuItemID);
    StudentMatrix.buildMenu();
  };

  function resetMenu(menuItemID) {
    StudentMatrix.deleteProperty('StudentMatrixMenu');
    StudentMatrix.buildMenu();
  };

  // Wrapper function to fetch and call a menu callback item.
  function callMenuItem(menuItemID) {
    debug(menuItemID);
    var menuItem = StudentMatrix.getProperty('StudentMatrixMenu', menuItemID.toString());
    if (menuItem != undefined && menuItem.callback != undefined) {
      StudentMatrix.callRecursive(menuItem.callback);
    }
  };

  // Reveal public functions and properties.
  return {
    name : 'Menu',
    description : 'Allows customizing menu entries for StudentMatrix.',
    version : '1.1',
    updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-menu.js',
    cell : 'D8',
    dependencies : {
      core : '3.0',
    },
    menuEntries : buildMenuEntries(),
    setMenuEntry : setMenuEntry,
    removeMenuEntry : removeMenuEntry,
    resetMenu : resetMenu,
    callMenuItem : callMenuItem,
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
