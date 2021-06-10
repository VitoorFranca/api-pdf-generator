module.exports = (req, res, next) => {
  const { studentName, courseName } = req.body;

  try{
    if(!studentName || !courseName)
      throw ('Invalid params.');
  
    if(typeof studentName != 'string' || typeof courseName != 'string')
      throw ('Invalid params.');
    
    if(studentName.length <= 5)
      throw ('Student name must be more than 5 characters.');

    next();
  }catch(error){
    res.json({
      error: true,
      message: error
    });
  }

}