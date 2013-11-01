StudentMatrix.plugins.boldname = {
  name : 'Make name bold',
  group : 'Examples',
  iterator : 'studentName',
  description : 'This is an example action. It makes the student name bold.',
  processor : function(object) {
    object.setFontWeight('bold');
  }
};

StudentMatrix.iterators.rowNumber = function(row) {
  return row;
}

StudentMatrix.iterators.studentName = function(row) {
  return StudentMatrix.mainSheet().getRange(row, StudentMatrix.getColumn('studentName'));
}
