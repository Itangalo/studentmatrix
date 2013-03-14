StudentMatrix -- a bit of documentation
=======================================

## What is the StudentMatrix?

StudentMatrix is a set of scripts for Google spreadsheets. They are built to be
used by teachers who want to be able to keep track of assessment matrices for a
large-ish number of students, without having to do more than necessary amount of
repetetive manual work.

Some things StudentMatrix can help you with:
* Create matrices for a whole class at once, and share each matrix (spreadsheet)
  with the relevant student.
* Create a feedback document for each student, too.
* Select a number of students and do updates to selected matrix cells. This is
  typically changing the color of the cells, but it could also be changing the
  cell content.

You can find this project on GitHub: https://github.com/Itangalo/studentmatrix
There is a short link available on http://tinyurl.com/studentmatrix


Videos in Swedish
=================

There are some Swedish videos showing how to use StudentMatrix over here:
http://tinyurl.com/studentmatrix-videor


Written documentation
=====================

## Starting up with StudentMatrix

### First step: Add the StudentMatrix scripts

If you want to use StudentMatrix, you will have to do the following:
* Create yourself a Google spreadsheet.
* Add the StudentMatrix scripts. You can either do this by searching for
  "StudentMatrix" in tools -> script gallery (once the code is approved), or by
  using tools -> script editor -> spreadsheet and pasting in the content of
  studentMatrix.js included in this project.
* When that is done, you will have to run the function "onOpen" to add the menu
  supplied by StudentMatrix. Do this by going to tools -> script manager, click
  "onOpen" and hit the "run" button.
* Now, at last, you will have a menu called "Matrix stuff". Open it and click
  the "Create settings sheets" option. This will set up some sheets you will
  need when using StudentMatrix.

Whew! That's a mouth full, and we haven't even got to the useful parts of
StudentMatrix yet. The good news is that this is something you'll only have to
do once.

### Second step: Create student matrices

Now we're ready to actually using some parts of StudentMatrix. The scripts are
used to manage copies of a spreadsheet for your students, so you'll have to have
a spreadsheet you want to copy. This is called the "template spreadsheet". I
will call the spreadsheet you set up in the first step the "master spreadsheet".

When you have one, the recommended workflow goes like this:
* Go to the "config" tab in your master spreadsheet. One of the entries is
  called "Key for spreadsheet template". Look in the URL for your template --
  there will be a part "key=XXXX". Copy the XXXX part (which is quite long) into
  the config box.
* Your template spreadsheet may contain several sheets (tabs). Take the name of
  the sheet actually used as assessment matrix and put it in config box called
  "Name of tab with matrix". This is case sensitive, so make sure to get it
  right.
* There are a few other settings you might want to change:
  - "Suffix for spreadsheet titles": Each student spreadsheet will get the
    student's name as title. If you want to append something to the name, this
    is where to do it.
  - "Make spreadsheets viewable by anyone": If you enter a "1" here, all new
    student matrices will be publically accessible. (You will probably have to
    give people a link manually, though.)
  - "Add student view permission to sheet": Setting this to "1" will explicitly
    add each student with view permissions to their sheet. This will make the
    sheet show up in their Google drive. Requires student emails to be gmail
    accounts.
  - "Add student edit permission to sheet": Like the setting above, but with
    edit access as well. Good if you want to have cooperate editing together
    with the student.
* When all these settings are done, head over to the "students" tab. Put student
  names in the designated column. If you're explicitly adding student access to
  the sheets, a gmail address will be needed in the email column too.
* Put a "1" in the update column for all students. This indicates which rows
  should be processed.
* In the matrix menu, select "Create student sheets" and sit back while
  StudentMatrix creates a bunch of spreadsheets for you. You will get links to
  each matrix, as they are created.

### Third step: Updating matrix content

You might be happy just having a lot of student matrices, but at some point you
will probably want to do updates to them. You can of course do updates manually
in each student's sheet, but StudentMatrix can help you do mass updates too.

A typical use case is to use assessment matrices to indicate what knowledge and
skills students have or haven't shown. This is typically done by color coding.
The "config" tab has three entries for color -- one for "unlocked" cells
(meaning tested but not approved), one for approved cells, and one for cells
that have been approved but no longer are ok. If you use color coding, set the
appropriate colors as cell background.

Then get yourself a copy of the template sheet. This is done from the Matrix
menu -> "Add new template sheet", and creates a copy of the template right in
your master spreadsheet.

There are a few operations you can do from the master spreadsheet.

* "Unlock student cell colors for selection": This will scan the currently
  selected cells in the template, and see if any cells are marked as unlocked or
  ok. Each such cell will be marked as unlocked in the student sheets, unless it
  was already marked as ok (in which case it will be left untouched).
* "Degrade selected cells to review status": This will scan the currently
  selected cells in the template and see if any are marked as ok or review. Each
  such cell will be marked for review in the student sheets, if it was
  previously marked as ok.
* "Force student cell colors to selected cells": This will update cell colors
  in the student sheets to match your selection, regardless of what color they
  had before. Good for marking cells as ok.
* "Set content of student cells": This changes the actual content in student
  sheets, to match the selection in the template. Good if you want to make
  changes in all the student sheets.

All of these actions depend on you marking a number of student sheets for update
on the "students" tab. Only the rows flagged with "1" in the update column will
be processed.


License and stuff
=================

These scripts are written and maintained by Johan Falk, math teacher over in
Sweden. Code is published under GNU General Public License, version 3 (GPL-3.0)
You are free to use, study, share and improve.

See license details at http://www.opensource.org/licenses/gpl-3.0.html

If you want to get involved in improving these scripts, feel free to contact me!
