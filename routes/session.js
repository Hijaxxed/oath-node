const express = require('express');
const router = express.Router();
 
router.get('/:variable?', function (req, res, next) {
   let variable = req.params.variable;
   let session = req.session;
 
   if(variable && session[variable]){
       res.status(200).json(session[variable]);
   }else{
       res.status(400).end();
   }
});
 
module.exports = router;