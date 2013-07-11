/**
 * Removes content and color for selected range and selected students.
 */
function studentMatrixHideRange() {
  var templateSheet = SpreadsheetApp.getActiveSheet();
  if (studentMatrixGetSourceTab() == null) {
    Browser.msgBox('This sheet is not copied from the template, and cannot be used for updating student sheets.');
    return;
  }
  var sourceRange = SpreadsheetApp.getActiveSheet().getActiveRange();
  var backgrounds = [];
  var values = [];
  for (var row in sourceRange.getBackgrounds()) {
    backgrounds[row] = [];
    values[row] = [];
    for (var column in sourceRange.getBackgrounds()[row]) {
      backgrounds[row][column] = 'white';
      values[row][column] = '';
    }
  }

  // Update the target sheets marked for update.
  for (var studentRow = FIRST_STUDENT_ROW; studentRow <= LAST_STUDENT_ROW; studentRow++) {
    var targetSheet = studentMatrixGetStudentSheet(studentRow, 'sheet');
    if (targetSheet == false) {
      continue;
    }
    var targetRange = targetSheet.getSheetByName(studentMatrixGetSourceTab()).getRange(sourceRange.getRow(), sourceRange.getColumn(), sourceRange.getNumRows(), sourceRange.getNumColumns());
    targetRange.setBackgroundColors(backgrounds);
    targetRange.setValues(values);
  }
}

/**
 * Reveals content and color for selected range and selected students.
 */
function studentMatrixRevealRange() {
  studentMatrixSetColor();
  studentMatrixSetContent();
}
