var Models = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;
var bcrypt = require('bcryptjs');

module.exports = {
    findUser: function (id, callback) {
        var id = id;
        console.log(id);
        /**Check id is ObjectId ? */
        if (ObjectId.isValid(id)) {
            Models.User.findById(id, function (err, doc) {
                if (err) { return callback(err) };
                if (doc) {
                    return callback(null, doc); // return not err and result doccument
                }
                else {
                    return callback(null, null); // not Find UserById
                }
            });
        }
        else {
            return callback('Invalid ObjectId'); // Id not ObjectId
        }
    },
    getUserByUsername: function (username, callback) {
        // check Input field is username or email
        var query = (username.indexOf('@') === -1) ? { username: username } : { email: username };
        Models.User.findOne(query, callback);
    },
    saveUser: function (user, callback) {
        var newUser = new Models.User(user);
        /** bcrypt password */
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) { return callback(err) };
                newUser.password = hash;
                newUser.save((err, doc) => {
                    if (err) return callback(err);
                    return callback(null, doc);
                });
            });
        });
    },
    updateUser: function (id, content, callback) {
        if (ObjectId.isValid(id)) {
            Models.User.findByIdAndUpdate(id, content, { new: true }, (err, doc) => {
                if (err) return callback(err);
                var user = {
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    username: doc.username,
                    email: doc.email
                }
                return callback(null, user);
            })
        }
        else {
            return callback('Invalid ObjectId');
        }
    },
    removeUser: function (id, callback) {

    },
    validate: function (username, email, password, passwordconfirm, callback) {
        Models.User.findOne({ username: username }, (err, doc) => {
            if (err) return callback(err);
            if (doc) {
                return callback(null, 'Username already exists, username: ' + username);
            }
            else {
                Models.User.findOne({ email: email }, (err, doc) => {
                    if (err) return callback(err);
                    if (doc) {
                        return callback(null, 'Email already exists, email: ' + email);
                    }
                    else {
                        if (password != passwordconfirm) {
                            return callback('Password not match');
                        } else {
                            return callback(null, null);
                        }
                    }
                });
            }
        });
    },
    comparePassword: function (candidatePassword, hash, callback) {
        bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
            if (err) throw err;
            callback(null, isMatch);
        });
    }
}