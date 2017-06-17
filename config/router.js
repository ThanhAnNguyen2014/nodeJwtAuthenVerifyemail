var express = require('express'),
    router = express.Router(),
    mockinfo=require('../config/mockinfo');
    config = require('./config'),
    passport=require('passport'),
    jwt = require('jsonwebtoken');
    

var sendmail = require('../controller/sendmail');
var api_userController = require('../controller/userController');
module.exports = function (app) {
    router.get('/sendmail', sendmail.sendmail);
    router.get('/api/user/:id', ensureAuthenticatedUser, api_userController.getUser);
    router.post('/api/user/register', api_userController.createUser);
    router.put('/api/user/:id', api_userController.updateUser);
    router.delete('/api/user/:id', api_userController.deleteUser);
    router.post('/api/user/check/validate', api_userController.validates);
    router.get('/api/verify/verify-account/', api_userController.verifyEmail);
    router.post('/api/user/login', api_userController.loginUser);


    /**Authentication User  */
    function ensureAuthenticatedUser(req, res, callback) {
        if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
            var token = req.headers.authorization;
            console.log(token.split(' ')[1]);
            jwt.verify(token.split(' ')[1], mockinfo.secret_user, function (err, decode) {
                if (err) {
                    req.userId = undefined;
                    return res.status(500).json({
                        code: res.statusCode,
                        results: {
                            message: 'Invalid Token! Please login.'
                        }
                    });
                }
                else {
                    req.userId = decode;
                    passport.authenticate('jwt', { session: false });
                    console.log('Id landlord: ' + req.userId.id);
                    callback();
                }
            });
        }
        else {
            req.userId = undefined;
            return res.status(401).json({
                code: res.statusCode,
                results: {
                    message: 'Unauthorized User!'
                }
            });
        }
    }
    app.use(router);
}