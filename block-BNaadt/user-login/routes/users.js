var express = require('express');
var router = express.Router();
var User = require('../models/User')


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with resource');
});

//render a form for registration
router.get('/register', (req, res) => {
  let uniqueEmail = req.flash('uniqueEmail')[0]
  let minimumPassword = req.flash('minimumPassword')[0]
  res.render('register', { uniqueEmail, minimumPassword })
})

//capture the data of registered users
router.post('/register', (req, res, next) => {
  let { email, password } = req.body
  if (password.length <= 4) {
    req.flash('minimumPassword', 'Maximum 4 character required in password')
    return res.redirect('/users/register')
  }
  if (!email) {
    req.flash('uniqueEmail', 'This email is already exist')
    return res.redirect('/users/register')
  }
  User.create(req.body, (err, user) => {
    if (err) return next(err)
    res.redirect('/users/login')
  })
})

//render a login form
router.get('/login', (req, res) => {
  let error = req.flash('error')[0]
  let noEmail = req.flash('noEmail')[0]
  let noPassword = req.flash('noPassword')[0]
  res.render('login', { error, noEmail, noPassword, })
})

//capture the data of login user
router.post('/login', (req, res, next) => {
  let { email, password } = req.body

  //check if no email and password
  if (!email || !password) {
    req.flash('error', 'Email/Password is required')
    return res.redirect('/users/login')
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    //no user
    if (!user) {
      req.flash('noEmail', 'Email is invalid')
      return res.redirect('/users/login')
    }
    //compare a password
    user.varifyPassword(password, (err, result) => {
      if (err) next(err)
      if (!result) {
        req.flash('noPassword', 'Password is invalid')
        return res.redirect('/users/login')
      }
      // persist logged in info
      req.session.userId = user.id
      res.redirect('/users/dashboard')
    })
  })


})


router.get('/dashboard', (req, res, next) => {
  res.render('dashboard')
})


router.get('/logout', (req, res) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/users/login')
})

module.exports = router;