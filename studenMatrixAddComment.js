/**
 * Removes content and color for selected range and selected students.
 */
function studentMatrixAddComment() {
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceRange = SpreadsheetApp.getActiveSheet().getActiveRange();
  var sourceNotes = sourceRange.getNotes();
  var rangeName = sourceRange.getA1Notation();

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      continue;
    }
    var targetRange = targetSheet.getSheetByName(studentMatrixGetSourceTab()).getRange(sourceRange.getRow(), sourceRange.getColumn(), sourceRange.getNumRows(), sourceRange.getNumColumns());
    
    for (var row in sourceNotes) {
      for (var column in sourceNotes[row]) {
        if (sourceNotes[row][column] != '') {
          var targetRow = parseInt(row) + 1;
          var targetColumn = parseInt(column) + 1;
          var existingNote = targetRange.getCell(targetRow, targetColumn).getNote();
          if (existingNote != '') {
            existingNote = existingNote + "\r";
          }
          targetRange.getCell(targetRow, targetColumn).setNote(existingNote + sourceNotes[row][column]);
        }
      }
    }
  }
}
