/**
 * @file
 * Module that allows custom menu entries for StudentMatrix.
 */

/**
 * Module for handling StudentMatrix menu entries.
 */
StudentMatrix.modules.menu = function() {
  // Reads entries in StudentMatrixMenu and builds menu callbacks for them.
  buildMenuEntries = function() {
    var customEntries = StudentMatrix.getProperty('StudentMatrixMenu');
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
  setMenuEntry = function(callback, label, weight, menuItemID) {
    if (menuItemID == undefined) {
      // Find the first unused entry in StudentMatrixMenu.
      var entries = StudentMatrix.getProperty('StudentMatrixMenu');
      for (i = 24; i >= 1; i--) {
        if (entries[i.toString()] == undefined) {
          menuItemID = i.toString();
        }
      }
    }
    if (menuItemID == undefined) {
      StudentMatrix.toast('All 24 menu places filled. Cannot add more.');
      return;
    }
    if (typeof menuItemID != 'string') {
      StudentMatrix.toast('Cannot set menu entry: Menu item ID must be between 1 and 24, represented as a string.');
      return;
    }

    // Build an entry and store it.
    var entry = {
      callback : callback,
      name : label,
      weight : weight,
    };
    StudentMatrix.setProperty(entry, 'StudentMatrixMenu', menuItemID);
  };

  removeMenuEntry = function(menuItemID) {
    var entries = StudentMatrix.deleteProperty('StudentMatrixMenu', menuItemID);
  };

  // Reveal public functions and properties.
  return {
    menuEntries : buildMenuEntries(),
    setMenuEntry : setMenuEntry,
    removeMenuEntry : removeMenuEntry,
  };
}();

// A number of function aliases, to make the menus work with Google API.
// The point of the functions is to call the appropriate callback stored in the
// StudentMatrix property 'StudentMatrixMenu'. BTW: Repeating code like this sucks.

function StudentMatrixMenu_1() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_2() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_3() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_4() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_5() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_6() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_7() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_8() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_9() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_10() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_11() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_12() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_13() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_14() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_15() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_16() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_17() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_18() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_19() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_20() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}
function StudentMatrixMenu_21() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_22() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_23() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}

function StudentMatrixMenu_24() {
  var index = arguments.callee.name.split('_')[1];
  var callback = StudentMatrix.getProperty('StudentMatrixMenu', index)['callback'];
  StudentMatrix.callRecursive(callback);
}
