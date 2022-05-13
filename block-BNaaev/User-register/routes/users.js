var express = require('express');
var router = express.Router();
var User = require('../models/User')

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find({}, (err, userList) => {
    if (err) return next(err)
    res.render('userList', { userList })
  })
});

// render a form to register
router.get('/register', (req, res, next) => {
  res.render('registerForm')
})

// capture the data
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err)
    console.log(err, user)
  })
})

module.exports = router;
