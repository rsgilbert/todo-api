let mongoose = require('mongoose')

module.exports.User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    }
})