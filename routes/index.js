var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

  res.redirect('offers');

});

// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Hello', name:"Georgi" });
// });

module.exports = router;
