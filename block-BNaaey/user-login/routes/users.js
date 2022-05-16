var express = require('express');
var router = express.Router();
var User = require('../models/User')

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session)
  res.send('Login Seccess');
});

//render a form for registration
router.get('/register', (req, res) => {
  res.render('register')
})

//capture the data of registered users
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err)
    res.redirect('/users/login')
  })
})

//render a login form
router.get('/login', (req, res) => {
  res.render('login')
})

//capture the data of login user
router.post('/login', (req, res, next) => {
  let { email, password } = req.body

  //check if no email and password
  if (!email || !password) {
    res.redirect('/users/login')
  }

  else {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
      //no user
      if (!user) {
        res.redirect('/users/login')
      }
      //users
      else {
        //compare a password
        user.varifyPassword(password, (err, result) => {
          if (err) next(err)
          if (!result) {
            res.redirect('/users/login')
          }
          // persist logged in info
          req.session.userId = user.id
          res.redirect('/users')
        })
      }
    })
  }

})



module.exports = router;
