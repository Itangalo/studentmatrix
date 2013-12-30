/**
 * @file
 * Settings plugin for overviewing plugins and modules.
 */

StudentMatrix.plugins.pluginList = {
  name : 'Plugin list',
  description : 'Shows plugins and modules, version info, dependencies, and links for updates.',
  version : '1.2',
  required : true,
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-pluginlist.js',
  cell : 'D7',
  dependencies : {
    core : '3.0',
    modules : {
      settings : '1.0',
    },
  },

  settings : {
    viewPlugins : {
      group : 'Plugin and module management',
      options : {
        moduleStatus : {},
        pluginStatus : {},
      },

      optionsBuilder : function(handler, container, defaults) {
        var app = UiApp.getActiveApplication();
        var statusMapping = StudentMatrix.plugins.pluginList.statusMapping;
        var updateInfo = SpreadsheetApp.openById('0AjgECFpHWbvRdE4yVHZRcGxEamVWUE1TalBLby12blE');

        // Display core version.
        var checkAllDependencies = StudentMatrix.addPluginHandler('pluginList', 'checkAllDependencies');
        container.add(app.createButton('Check unchecked dependencies', checkAllDependencies).setId('checkDependencies'));
        container.add(app.createButton('Check all dependencies', checkAllDependencies).setId('recheckDependencies'));
        container.add(app.createAnchor('Video on how to update modules and plugins', 'http://www.youtube.com/watch?v=3u675Bnnlx0'));
        container.add(app.createHTML('<strong>StudentMatrix version:</strong> ' + StudentMatrix.versionName + ' (api version ' + StudentMatrix.version + ')<br/><br/>'));

        // Build a grid displaying status, name, description and link to source code for each module.
        container.add(app.createHTML('<strong>Modules</strong>'));
        var moduleGrid = app.createGrid(Object.keys(StudentMatrix.modules).length, 3);
        container.add(moduleGrid);
        var row = 0;
        var moduleSelect = {};
        for (var module in StudentMatrix.modules) {
          // Build the select list for the module status.
          moduleSelect[row] = app.createListBox().setName('moduleStatus-' + module).setId('moduleStatus-' + module);
          for (var option in statusMapping) {
            moduleSelect[row].addItem(statusMapping[option].name, option);
          }
          // Set the selected value in the list, if there is a prior value.
          if (defaults.moduleStatus[module] != undefined) {
            moduleSelect[row].setSelectedIndex(statusMapping[defaults.moduleStatus[module]].index);
          }
          if (StudentMatrix.modules[module].required == true) {
            moduleSelect[row].setSelectedIndex(statusMapping.required.index);
            moduleSelect[row].setEnabled(false);
          }
          handler.addCallbackElement(moduleSelect[row]);
          checkAllDependencies.addCallbackElement(moduleSelect[row]);
          moduleGrid.setWidget(row, 0, moduleSelect[row]);

          // Name, version, description, and a link to source code for updates.
          if (defaults.moduleStatus[module] == 'autoDisabled') {
            var extras = ' <em>Dependencies not met.</em>';
          }
          else {
            var extras = '';
          }
          moduleGrid.setWidget(row, 1, app.createHTML('<strong>' + StudentMatrix.modules[module].name + '</strong> (v. ' + StudentMatrix.modules[module].version + ')<br/>' + StudentMatrix.modules[module].description + extras));

          // Check for latest version of the module. Display a link if there is an update.
          if (StudentMatrix.modules[module].cell != undefined) {
            var latestVersion = updateInfo.getSheetByName('modules').getRange(StudentMatrix.modules[module].cell).getValue();
            if (StudentMatrix.plugins.pluginList.verifyVersionDependency(latestVersion, StudentMatrix.modules[module].version) == false) {
              moduleGrid.setWidget(row, 2, app.createAnchor('Updates!', StudentMatrix.modules[module].updateUrl))
            }
          }
          else {
            moduleGrid.setWidget(row, 2, app.createAnchor('code', StudentMatrix.modules[module].updateUrl))
          }
          row++;
        }

        // Add a similar list for plugins.
        container.add(app.createHTML('<strong>Plugins</strong>'));
        var pluginGrid = app.createGrid(Object.keys(StudentMatrix.plugins).length, 3);
        container.add(pluginGrid);
        var row = 0;
        var pluginSelect = {};
        for (var plugin in StudentMatrix.plugins) {
          pluginSelect[row] = app.createListBox().setName('pluginStatus-' + plugin).setId('pluginStatus-' + plugin);
          for (var option in statusMapping) {
            pluginSelect[row].addItem(statusMapping[option].name, option);
          }
          if (defaults.pluginStatus[plugin] != undefined) {
            pluginSelect[row].setSelectedIndex(statusMapping[defaults.pluginStatus[plugin]].index);
          }
          if (StudentMatrix.plugins[plugin].required == true) {
            pluginSelect[row].setSelectedIndex(statusMapping.required.index);
            pluginSelect[row].setEnabled(false);
          }

          handler.addCallbackElement(pluginSelect[row]);
          checkAllDependencies.addCallbackElement(pluginSelect[row]);
          pluginGrid.setWidget(row, 0, pluginSelect[row]);

          pluginGrid.setWidget(row, 1, app.createHTML('<strong>' + StudentMatrix.plugins[plugin].name + '</strong> (v. ' + StudentMatrix.plugins[plugin].version + ')<br/>' + StudentMatrix.plugins[plugin].description));

          // Check for latest version of the module. Display a link if there is an update.
          if (StudentMatrix.plugins[plugin].cell != undefined) {
            var latestVersion = updateInfo.getSheetByName('plugins').getRange(StudentMatrix.plugins[plugin].cell).getValue();
            if (StudentMatrix.plugins.pluginList.verifyVersionDependency(latestVersion, StudentMatrix.plugins[plugin].version) == false) {
              pluginGrid.setWidget(row, 2, app.createAnchor('Updates!', StudentMatrix.plugins[plugin].updateUrl))
            }
          }
          else {
            pluginGrid.setWidget(row, 2, app.createAnchor('code', StudentMatrix.plugins[plugin].updateUrl))
          }
          row++;
        }
      },

      // Process and store status for all the modules and plugins.
      optionsSaver : function(eventInfo) {
        var moduleStatus = {};
        for (var module in StudentMatrix.modules) {
          moduleStatus[module] = eventInfo.parameter['moduleStatus-' + module];
        }
        StudentMatrix.setProperty(moduleStatus, 'moduleStatus');

        var pluginStatus = {};
        for (var plugin in StudentMatrix.plugins) {
          pluginStatus[plugin] = eventInfo.parameter['pluginStatus-' + plugin];
        }
        StudentMatrix.setProperty(pluginStatus, 'pluginStatus');
        return UiApp.getActiveApplication();
      },
    },
  },

  handlers : {
    checkAllDependencies : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var statusMapping = StudentMatrix.plugins.pluginList.statusMapping;
      var anythingDisabled = false;

      // Check dependencies for all present modules.
      for (module in StudentMatrix.modules) {
        if (eventInfo.parameter['moduleStatus-' + module] == 'needsCheck' || (eventInfo.parameter.source == 'recheckDependencies' && eventInfo.parameter.source == 'required')) {
          var selectList = app.getElementById('moduleStatus-' + module);
          var dependencies = StudentMatrix.modules[module].dependencies;
          if (dependencies == undefined) {
            StudentMatrix.toast('Undeclared dependencies: ' + module);
          }
          else {
            if (StudentMatrix.plugins.pluginList.verifyDependencies(dependencies) == true) {
              selectList.setSelectedIndex(statusMapping.autoEnabled.index);
            }
            else {
              selectList.setSelectedIndex(statusMapping.autoDisabled.index);
              anythingDisabled = true;
            }
          }
        }
      }

      // Check dependencies for all present plugins.
      for (plugin in StudentMatrix.plugins) {
        if (eventInfo.parameter['pluginStatus-' + plugin] == 'needsCheck' || (eventInfo.parameter.source == 'recheckDependencies' && eventInfo.parameter.source == 'required')) {
          var selectList = app.getElementById('pluginStatus-' + plugin);
          var dependencies = StudentMatrix.plugins[plugin].dependencies;
          if (dependencies == undefined) {
            StudentMatrix.toast('Undeclared dependencies: ' + plugin);
          }
          else {
            if (StudentMatrix.plugins.pluginList.verifyDependencies(dependencies) == true) {
              selectList.setSelectedIndex(statusMapping.autoEnabled.index);
            }
            else {
              selectList.setSelectedIndex(statusMapping.autoDisabled.index);
              anythingDisabled = true;
            }
          }
        }
      }
    },
  },

  // Helper function taking an object of core, module and plugin dependencies, and checking if they are met.
  verifyDependencies : function(dependencyList) {
    // Check core compatibility, if specified.
    if (dependencyList.core != undefined) {
      if (StudentMatrix.plugins.pluginList.verifyVersionDependency(dependencyList.core, StudentMatrix.version) == false) {
        return false;
      }
    }
    // Check all module compatibilities, if specified.
    if (dependencyList.modules != undefined) {
      for (var module in dependencyList.modules) {
        if (StudentMatrix.modules[module] == undefined) {
          return false;
        }
        if (StudentMatrix.plugins.pluginList.verifyVersionDependency(dependencyList.modules[module], StudentMatrix.modules[module].version) == false) {
          return false;
        }
      }
    }
    // Check all plugin compatibilities, if specified.
    if (dependencyList.plugins != undefined) {
      for (var plugin in dependencyList.plugins) {
        if (StudentMatrix.plugins[plugin] == undefined) {
          return false;
        }
        if (StudentMatrix.plugins.pluginList.verifyVersionDependency(dependencyList.plugins[plugin], StudentMatrix.plugins[plugin].version) == false) {
          return false;
        }
      }
    }
    // If we got this far, all dependencies are met.
    return true;
  },

  // Helper function, checking if a version number meets requirements.
  verifyVersionDependency : function(required, existing) {
    if (required.indexOf('.') == -1 || existing.indexOf('.') == -1) {
      return false;
    }
    required = required.split('.');
    existing = existing.split('.');

    if (required[0] != existing[0]) {
      return false;
    }

    if (parseInt(required[1]) > parseInt(existing[1])) {
      return false;
    }
    return true;
  },

  // Helper object to map indices in select lists with stored data.
  statusMapping : {
    needsCheck : {
      index : 0,
      name : 'dependency not checked',
    },
    required : {
      index : 1,
      name : 'required',
    },
    autoEnabled : {
      index : 2,
      name : 'checked and enabled',
    },
    autoDisabled : {
      index : 3,
      name : 'automatically disabled',
    },
    manualDisabled : {
      index : 4,
      name : 'manually disabled',
    },
    forced : {
      index : 5,
      name : 'forced enabled',
    },
  },
};
