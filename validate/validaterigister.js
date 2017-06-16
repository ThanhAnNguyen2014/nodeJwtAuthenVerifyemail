var userServices = require('../services/userService.js');
var async = require('async');
var Models=require('../models/index');

module.exports = function (username, email, password, passwordconfirm, callback) {
    var messageErr = {
        usernameError: null,
        emailError: null,
        passwordconfirmError: null
    };
    async.parallel([
        (next) => {
            // check username
        Models.User.findOne({username: username}, callback)
        },
        (next) => {
            // check email
            Models.User.findOne({email: email}, callback);
        },
        (next) => {
            // confirm password
            if (password != passwordconfirm) {
                callback();
            }
            
        }
    ], (err, results) => {
        messageErr = {
            usernameError: results[0],
            emailError: results[1],
            passwordconfirmError: results[2]
        };
        callback(messageErr);
    })
   
}