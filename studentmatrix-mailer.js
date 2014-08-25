/**
 * @file
 * StudentActions for sending e-mails to students based on templates and master sheet content.
 */

StudentMatrix.plugins.mailer = {
  name : 'E-mail sender',
  description : 'Allows sending e-mails to students based on templates and content in master sheet.',
  version : '1.0',
  updateUrl : 'https://raw.github.com/Itangalo/studentmatrix/3.x/studentmatrix-mailer.js',
  cell : 'D10',
  dependencies : {
    core : '3.1',
    modules : {
      studentActions : '1.0',
    },
  },

  studentActions : {
    sendTemplateMail : {
      name : 'Send e-mail to students based on a template',
      group : 'E-mail sender',
      description : 'Uses a Google document as template for e-mails, allowing place holder tokens to be replaced by data from the master sheet.',

      processor : function(row, options) {
        Logger.log(options);
        var studentMail = StudentMatrix.components.fetchers.studentColumnValue(row, 'studentMail');
        var mailContent = DocumentApp.openById(options.fileId).getBody().getText();
        mailContent = StudentMatrix.replaceColumnTokens(mailContent, row);

        MailApp.sendEmail(studentMail, options.subject, mailContent);
      },
      validator : function() {
      },

      options : {
        fileId : true,
        subject : 'E-mail from your teacher',
      },
      optionsBuilder : function(handler, container) {
        var app = UiApp.getActiveApplication();
        var fileHandler = StudentMatrix.addPluginHandler('mailer', 'showFilePicker');
        container.add(app.createButton('Select template', fileHandler));
        container.add(app.createAnchor('no file selected', '').setId('fileLink').setVisible(false));

        var fileId = app.createTextBox().setId('fileId').setName('fileId').setVisible(false);
        container.add(fileId);
        handler.addCallbackElement(fileId);

        container.add(app.createLabel('Email subject'));
        var subject = app.createTextBox().setId('subject').setName('subject');
        container.add(subject);
        handler.addCallbackElement(subject);

        return app;
      },
    },
  },

  handlers : {
    showFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      var handler = StudentMatrix.addPluginHandler('mailer', 'closeFilePicker');
      app.createDocsListDialog().setDialogTitle('Select document to use as email template').setInitialView(UiApp.FileType.DOCUMENTS).addSelectionHandler(handler).showDocsPicker();
      return app;
    },
    closeFilePicker : function(eventInfo) {
      var app = UiApp.getActiveApplication();
      app.getElementById('fileId').setText(eventInfo.parameter.items[0].id);
      app.getElementById('fileLink').setVisible(true).setText(eventInfo.parameter.items[0].name).setHref(eventInfo.parameter.items[0].url);
      Logger.log(eventInfo.parameter.items[0].id);
      return app;
    },
  },
};
