let mongoose = require('mongoose')
let Schema = mongoose.Schema
let bcrypt = require('bcrypt')

let userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 5, max: 8 },
    age: { type: Number, required: true },
    phone: { type: Number, minlength: 10 }
})

userSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if (err) return next(err)
            this.password = hashed
            return next(err)
        })
    } else {
        next()
    }
})

module.exports = mongoose.model('User', userSchema)
