var express = require('express');
var router = express.Router();
var User = require('../models/User')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//render a registration form
router.get('/register', (req, res) => {
  let error = req.flash('error')[0]
  res.render('register', { error })
})

//capture the data of the register user
router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.name === 'ValidatorError') {
        req.flash('error', err.message)
        return res.redirect('/users/register')
      }
      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is already exist')
        return res.redirect('/users/register')
      }
    }
    res.redirect('/users/login')
  })
})

//render a login form
router.get('/login', (req, res) => {
  let error = req.flash('error')[0]
  console.log(req.session)
  res.render('login', { error })

})

//capture the data of the login user
router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  //no email
  if (!email || !password) {
    req.flash('error', 'Email/Password is required')
    return res.redirect('/users/login')
  }

  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    if (!user) {
      req.flash('error', 'Email is invalid')
      return res.redirect('/users/login')
    }
    //compare password
    user.varifyPassword(password, (err, result) => {
      if (err) return next(err)
      if (!result) {
        req.flash('error', 'Password is invalid')
        return res.redirect('/users/login')
      }
      //persist a logged in information
      req.session.userId = user._id
      res.redirect('/users/dashboard')
    })
  })
})

router.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

router.get('/logout', (req, res) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/users/login')
})

module.exports = router;
