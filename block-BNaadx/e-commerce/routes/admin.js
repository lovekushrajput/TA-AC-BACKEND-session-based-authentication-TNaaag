var express = require('express');
const { diskStorage } = require('multer');
var router = express.Router();
var multer = require('multer');
var Product = require('../models/Product')
var fs = require('fs')

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

let upload = multer({ storage: storage })

//products list
router.get('/', (req, res, next) => {
    if (req.session.userId === undefined) {
        req.flash('error', 'Unauthorised')
        return res.redirect('/users/login')
    }
    Product.find({}, (err, products) => {
        if (err) return next(err)
        res.render('productList', { products })
    })
})

//add product
router.get('/product', (req, res) => {
    if (req.session.userId === undefined) {
        req.flash('error', 'Unauthorised')
        return res.redirect('/users/login')
    }
    res.render('productForm')
})

//capture the product
router.post('/product', upload.single('productImage'), (req, res, next) => {
    if (req.file) {
        req.body.productImage = req.file.filename
    }
    Product.create(req.body, (err, product) => {
        if (err) return next(err)
        res.redirect('/admin')
    })
})


//Edit product 
router.get('/product/:id/edit', (req, res, next) => {
    let id = req.params.id
    Product.findById(id, (err, product) => {
        if (err) return next(err)
        res.render('productEdit', { product })
    })
})


// capture the data
router.post('/product/:id/edit', upload.single('productImage'), (req, res, next) => {
    let id = req.params.id
    let newImage = ''
    if (req.file) {
        newImage = req.file.filename
        try {
            //delete the old image
            fs.unlinkSync('./public/images/' + req.body.productImage)
        } catch (error) {
            console.log(error)
        }
    } else {
        newImage = req.body.productImage
    }
    req.body.productImage = newImage
    Product.findByIdAndUpdate(id, req.body, (err, product) => {
        if (err) return next(err)
        res.redirect('/admin')
    })
})


//delete the product
router.get('/product/:id/delete', (req, res) => {
    let id = req.params.id
    Product.findByIdAndDelete(id, (err, product) => {
        if (err) return next(err)
        if (product.productImage) {
            try {
                fs.unlinkSync('./public/images/' + product.productImage)
            } catch (error) {
                console.log(error);
            }
        }
        res.redirect('/admin')
    })
})


module.exports = router