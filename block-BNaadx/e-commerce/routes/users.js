var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Product = require('../models/Product');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
  let error = req.flash('error')[0]
  res.render('register', { error })
});


router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      //email error
      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is already exist')
        return res.redirect('/users/register')
      }
      //validation error
      if (err.name === 'ValidationError') {
        req.flash('error', err.message)
        return res.redirect('/users/register')
      }
    }
    // redirected to login 
    res.redirect('/users/login')
  })
});


router.get('/login', (req, res, next) => {
  let error = req.flash('error')[0]
  res.render('login', { error })
});


router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  //no email and password
  if (!email || !password) {
    req.flash('error', 'Email/Password is required')
    return res.redirect('/users/login')
  }
  //admin login
  else if (email === 'lovekushrazput143@gmail.com') {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
      //no email
      if (!user) {
        req.flash('error', 'Invalid Email')
        return res.redirect('/users/login')
      }
      //varify the password
      user.varifyPassword(password, (err, result) => {
        if (err) return next(err)
        // no password
        if (!result) {
          req.flash('error', 'Invalid Password')
          return res.redirect('/users/login')
        }
        //persist a logged in information
        req.session.userId = user._id
        if (req.session.userId) {
          //dashboard
          return res.redirect('/users/admin')
        } else {
          res.redirect('/users/login')
        }
      })
    })
  }


  //user login
  else {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
      //no email
      if (!user) {
        req.flash('error', 'Invalid Email')
        return res.redirect('/users/login')
      }
      //varify the password
      user.varifyPassword(password, (err, result) => {
        if (err) return next(err)
        // no password
        if (!result) {
          req.flash('error', 'Invalid Password')
          return res.redirect('/users/login')
        }
        //persist a logged in information
        req.session.userId = user._id
        if (req.session.userId) {
          //dashboard
          return res.redirect('/users/dashboard')
        } else {
          res.redirect('/users/login')
        }
      })
    })
  }


})

//user dashboard
router.get('/dashboard', function (req, res, next) {
  if (req.session.userId === undefined) {
    req.flash('error', 'login first')
    return res.redirect('/users/login')
  }
  User.findById(req.session.userId, (err, user) => {
    if (err) return next(err)
    Product.find({}, (err, products) => {
      if (err) return next(err)
      res.render('dashboard', { products, user })
    })
  });
})



//admin
router.get('/admin', function (req, res, next) {
  if (req.session.userId === undefined) {
    req.flash('error', 'Unauthorised')
    return res.redirect('/users/login')
  }
  res.redirect('/admin')
});


//logout
router.get('/logout', (req, res, next) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/users/login')
})


//product details
router.get('/product/:id', (req, res, next) => {
  let id = req.params.id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    res.render('productDetails', { product })
  })
})


//like product
router.get('/product/:id/like', (req, res, next) => {
  let id = req.params.id
  Product.findByIdAndUpdate(id, { $inc: { like: +1 } }, (err, product) => {
    if (err) return next(err)
    res.redirect('/users/product/' + id)
  })
})

//dislike product
router.get('/product/:id/dislike', (req, res, next) => {
  let id = req.params.id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    if (product.like > 0) {
      Product.findByIdAndUpdate(id, { $inc: { like: -1 } }, (err, product) => {
        if (err) return next(err)
        return res.redirect('/users/product/' + id)
      })
    } else {
      return res.redirect('/users/product/' + id)
    }
  })

})


router.get('/cart', (req, res, next) => {
  if(req.session.userId){
    User.findById(req.session.userId).populate('cart').exec((err,product)=>{
      if(err) return next(err)
     return res.render('cart',{product})
    })
  }else{
    req.flash('error','login required')
    res.redirect('/users/login')
  }

})

//add item to cart
router.get('/product/:id/cart', (req, res) => {
  let id = req.params.id
 
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    User.findByIdAndUpdate(req.session.userId,{$push : {cart: product._id}},(err,user)=>{
      if(err) return next(err)
      res.redirect('/users/cart')
    })
  })
})

//remove item from cart
router.get('/cart/:id',(req,res,next)=>{
  let id = req.params.id
  Product.findById(id,(err,product)=>{
    if(err) return next(err)
    User.findByIdAndUpdate(req.session.userId,{$pull : {cart: product._id}},(err,user)=>{
      if(err) return next(err)
      res.redirect('/users/cart')
    })
  })
})

//buy now
router.get('/buy',(req,res,next)=>{
  if(req.session.userId){
 return res.render('buyNow')
  }
  req.flash('error','login required')
  res.redirect('/users/login')
})
module.exports = router;

