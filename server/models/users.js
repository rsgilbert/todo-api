const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 3
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})
UserSchema.methods.generateAuthToken = function () { //not overwrite, creates instance method
    let user = this
    let access = 'auth'
    let token = jwt.sign({ access, _id: user._id.toHexString() }, process.env.JWT_SECRET).toString()
    user.tokens = user.tokens.concat([{ access, token }])
    return user.save().then(() => token)
} 

UserSchema.methods.toJSON = function() {//overwrites mongoose method called toJSON
    let user = this
    let userObject = user.toObject()
    return _.pick(userObject, ['_id','email'])
}
UserSchema.methods.removeToken = function(token) {
    let user = this
    return user.updateOne({
        $pull: {
            tokens: {
                token  // removes the entire object from tokens array
            }
        }
    })
}
UserSchema.statics.findByToken = function(token){ //statics is for creating model methods 
    let User = this //model User
    let decoded
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) { return Promise.reject() }
    return User.findOne({
        '_id': decoded._id,
        'tokens.access': 'auth',
        'tokens.token': token,
    })
}
UserSchema.statics.findByCredentials = function(email, password) {
    let User = this
    return User.findOne( { email }).then((user) => {
        if(!user) return Promise.reject()
        return new Promise((resolve, reject) => { // cuz bcryptjs doesnot support promises
            bcrypt.compare(password, user.password, (err, res) => {
                res ? resolve(user) : reject()
            })
        })
    })
}
UserSchema.pre('save', function(next){//pre is mongoose middleware
    let user = this
    if(user.isModified('password')){
        bcrypt.genSalt(5, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(!err) {
                    user.password = hash
                    next()
                }
            })
        })
    } else next()
})
module.exports.User = mongoose.model('User', UserSchema)

