StudentMatrix -- a bit of documentation
=======================================

## What is the StudentMatrix?

StudentMatrix is a set of scripts for Google spreadsheets. They are built to be
used by teachers who want to be able to keep track of assessment matrices for a
large-ish number of students, without having to do more than necessary amount of
repetetive manual work.

Some things StudentMatrix can help you with:
* Create matrices (spreadsheets) for a whole class at once, and share each
  matrix with the relevant student.
* Do mass-changes of selected matrix cells, for selected students.
* Get quick sums of how the students are doing with some parts of the matrix.
* Allow students to edit *one* tab of their matrix (for self-assessment).
* Create a feedback document for each student, and share with them.
* Send email to students, where parts of the content may be varied for each
  student.
* Make automatic updates of student cells based on progress on Khan Academy
  (see http://www.khanacademy.org/exercisedashboard).

You can find this project on GitHub: https://github.com/Itangalo/studentmatrix
There is a short link available on http://tinyurl.com/studentmatrix
There is a Google spreadsheed available for copy and quick-start at
http://tinyurl.com/studentmatrix-master

## Vad är StudentMatrix?

StudentMatrix är ett verktyg för att hjälpa lärare att hålla reda på
bedömningsmatriser för elever. För att använda StudentMatrix behöver matriserna
vara kalkylblad i Google Drive.

StudentMatrix kan bland annat hjälpa dig med:
* Att skapa en kopia av matrisen för varje elev, och dela med eleven.
* Att färgmarkera rutor i matrisen för många elever på en gång.
* Att läsa av status för matrisrutor för många elever på en gång.
* Att låta eleven redigera en flik i sin matris (för egenbedömning).
* Att skapa ett feedbackdokument för varje elev, och dela med eleven.
* Att skicka mail till eleverna, där delar av innehållet varieras för varje
  elev.

Det finns även integration med Khan Academy, men den behöver fortfarande putsas
och dokumenteras.

Tekniskt sett är StudentMatrix en samling skript för Google Apps. Skripten är
(och kommer att förbli) fritt tillgängliga. De går att nå på
https://github.com/itangalo/studentmatrix. Där kan du också föreslå förändringar
och förbättringar.

* Det finns videoguider för hur du använder StudentMatrix här:
  http://tinyurl.com/studentmatrix-videor
* En skriven guide/lathund finns här: http://tinyurl.com/studentmatrix-lathund


Khan Academy integration
========================

StudentMatrix integrates with Khan Academy in two ways:

* "Run Khan updates": This will read information from the tab "Khan exercises"
  in the master spreadsheet, and mark cells OK in student sheets if they have
  completed ALL the exercises listed for each cell. An exception is made if the
  student cell is marked for review -- if so, the exercises on Khan Academy must
  not only be completed, but also NOT marked for review.
* "Update Khan goals": This will read information from the tab "Khan goals"
  and update the tab "Khan goals" on student sheets. On the student sheets, the
  tab will show each listed goal together with the exercises set for that goal.
  Each exercise will be displayed with how many times the student have tried
  that particular exercise, and a proficiency level (0-100%). The background
  color will be set to the same percentage of the OK color. Finally, the goal
  will be colored as OK if all its exercises are at 100%.

To use these actions, you will need API keys for Khan Academy, and enter them
into your config. That will have to be done manually -- sorry.

These two features are still kind of experimental, and will not appear in the
menu unless you add a sheet with the name "Khan exercises". If you want to get
started quickly, just copy the spreadsheet found at
http://tinyurl.com/studentmatrix-master


License and stuff
=================

These scripts are written and maintained by Johan Falk, math teacher over in
Sweden. Code is published under GNU General Public License, version 3 (GPL-3.0)
You are free to use, study, share and improve.

See license details at http://www.opensource.org/licenses/gpl-3.0.html

If you want to get involved in improving these scripts, feel free to contact me!
