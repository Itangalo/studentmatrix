studentmatrix
=============

StudentMatrix was originally a script for making mass updates to the colors and
contents of Google spreadsheets, allowing managing spreadsheets for students in
a class in a convenient way.

StudentMatrix 3.x has evolved to a framework for running arbitrary actions on
students in a (spreadsheet) list. The idea is this:

* You have a list of students in a Google spreadsheet
* You have StudentMatrix plugins allowing different actions, such as e-mailing
  students, copying and sharing files, creating Google Drive folders, or
  making some updates to student spreadsheets.
* You select an action to run, and which students to run it on.

There is a video showing the basics of StudentMatrix here:
https://www.youtube.com/watch?v=lc7lo_DqEPQ

Some more videos can be found at http://tinyurl.com/studentmatrix-videor (and
some of the videos are in Swedish).

If you Google script coder, you can write new plugins to StudentMatrix. Plugins
can add new actions to run on students (such as "remove edit access to a file"),
declare new columns that should be used for reading/storing student specific
data (such as "folder that student can edit"), and also add new "global"
settings to StudentMatrix (such as "e-mails to teachers that should be granted
view access to student folders").

The file studentmatrix-api.js contains well-commented examples of how plugins
can be made.
