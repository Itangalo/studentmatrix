StudentMatrix.studentActions.boldname = {
  name : 'Make name bold',
  group : 'Examples',
  description : 'This is an example action. It makes the student name bold.',
  helpLink : 'http://www.dn.se/nyheter/vetenskap/nobelpristagare-river-katedern/',
  iterator : 'studentName',
  processor : function(object) {
    object.setFontWeight('bold');
  },
  validator : function() {
    if (typeof StudentMatrix.getProperty('StudentMatrixColumns', 'studentName') == 'undefined') {
      return 'No column for student names declared!';
    }
  },
};

StudentMatrix.iterators.rowNumber = function(row) {
  return row;
}

StudentMatrix.iterators.studentName = function(row) {
  return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getProperty('StudentMatrixColumns', 'studentName'));
}
