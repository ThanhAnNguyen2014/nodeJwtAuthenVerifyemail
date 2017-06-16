var mongoose = require('mongoose'),
    validators = require('mongoose-validators'),
    Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
    firstname: { type: String },
    lastname: { type: String },
    username: {
        type: String, required: [true, 'Username not empty!'], lowercase: true,
        minlength:[6, 'User name must be greater than 6'], maxlength:[20, 'characters and less than 20 characters']
    },
    password: {
        type: String, required: true,
        validate: [validators.isLength(6, 100)]
    },
    email: { type: String, required: true, validate: validators.isEmail() },
    active: { type: Boolean, default: false },
    tokenJWTtemp: { type: String, default: null },
    status: { type: Boolean, default: true },
    createdate: { type: Date, default: Date.now() }
})
module.exports = User = mongoose.model('User', UserSchema);