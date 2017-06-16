var userServices = require('../services/userService.js');
var async = require('async');
var mockinfo = require('../config/mockinfo');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = {
    getUser: function (req, res) {
        var id = req.params.id;
        userServices.findUser(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    code: res.statusCode,
                    results: {
                        message: err
                    }
                });
            }
            else {
                if (user) {
                    return res.status(200).json({
                        code: res.statusCode,
                        results: {
                            user: user
                        }
                    });
                }
                else {
                    return res.status(404).json({
                        code: res.statusCode,
                        results: {
                            message: '404, User Not Found'
                        }
                    });
                }
            }
        });
    },
    /**Register Account */
    createUser: function (req, res) {
        // URL verify account
        var url = '127.0.0.1/api/verify/verify-account/?token=';
        var user = req.body;
        userServices.saveUser(user, (err, result) => {
            if (err) {
                return res.status(500).json({
                    code: res.statusCode,
                    results: {
                        message: err
                    }
                });
            };
            // create token
            var token = 'JWT ' + jwt.sign({ id: result._id }, mockinfo.secret_user, {
                expiresIn: '24h', // one house
                algorithm: 'HS256'
            });
            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: true, // secure:true for port 465, secure:false for port 587
                auth: {
                    user: mockinfo.email,
                    pass: mockinfo.password
                }
            });
            // setup email data with unicode symbols
            var mailOptions = {
                from: '"FSL-IO 👻" <' + mockinfo.email + '>', // sender address
                to: user.email, // list of receivers
                subject: '[FSL-IO] Please verify your email address ✔.', // Subject line
                text: 'Verify Account from system FSL-IO', // plain text body
                html: '<a href="' + url + token + '">Click to verify account</a>', // html body
                html: '<p>Hi <strong>@' + user.firstname + '!</strong></p><p>Help us secure your FSL-IO &nbsp;account by verifying your email address (' + user.email + '). This lets you access all of FSL-IO' + "'s" + ' features.</p><p><a href="' + url + token + '">verify email adderss</a></p><p>Button not working? Please the following link into your browser:</p><p><a href="' + url + token + '">' + url + token + '</a></p><p>You' + "'" + 're receiving this email because you recently create a new FSL-IO &nbsp;account or added a new email address. If this wasn' + "'" + 't you, please ignore this email.</p>'

            };
            console.log(mailOptions);
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
            return res.status(200).json({
                code: res.statusCode,
                results: {
                    message: 'You have successfully registered. You need to verify the email to use the account'
                }
            });
        });
    },
    updateUser: function (req, res) {

    },
    deleteUser: function (req, res) {

    },
    validates: function (req, res) {
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var passwordconfirm = req.body.passwordconfirm;

        userServices.validate(username, email, password, passwordconfirm, (err, result) => {
            if (err) {
                return res.status(500).json({
                    code: res.statusCode,
                    results: {
                        message: err
                    }
                });
            }
            return res.status(200).json({
                code: res.statusCode,
                results: {
                    message: result
                }
            });
        });
    },
    verifyEmail: function (req, res) {
        // check header or url parameters or post parameters for token
        const token = req.body.token || req.query.token ||
            req.headers['x-access-token'];
        console.log('--------');
        console.log(token.split(' ')[1]);
        // decode token 
        jwt.verify(token.split(' ')[1], mockinfo.secret_user, function (err, decode) {
            if (err) {
                req.userId = undefined;
                return res.status(500).json({
                    code: res.statusCode,
                    results: {
                        message: err
                    }
                });
            }
            else {
                console.log(decode);
                req.userId = decode;

                userServices.findUser(req.userId.id, (err, doc) => {
                    if (err) {
                        return res.status(500).json({
                            code: res.statusCode,
                            results: {
                                message: err
                            }
                        });
                    }
                    if (doc) {
                        doc.tokenJWTtemp = token;
                        doc.active = true;
                        console.log(doc);
                        userServices.updateUser(req.userId.id, doc, (err, result) => {
                            if (err) {
                                return res.status(500).json({
                                    code: res.statusCode,
                                    results: {
                                        message: err
                                    }
                                });
                            }
                            return res.status(200).json({
                                code: res.statusCode,
                                results: {
                                    message: 'Your account is now verified. Congratulations!',
                                    doc: result
                                }
                            });
                        })
                    }
                    else {
                        return res.status(404).json({
                            code: res.statusCode,
                            results: {
                                message: 'User not found!'
                            }
                        });
                    }
                });
            }
        });

    },
    loginUser: function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username === '' || password === ' ') {
            return res.status(500).json({
                code: res.statusCode,
                results: {
                    message: 'err: Username or Password not empty!'
                }
            });
        }
        else {
            userServices.getUserByUsername(username, function (err, user) {
                if (err) res.status(500).json({
                    code: res.statusCode,
                    results: {
                        message: 'err: ' + err,
                        doc: null
                    }
                });
                if (!user) {
                    return res.status(404).json({
                        code: res.statusCode,
                        results: {
                            success: false,
                            message: 'User not found!',
                            doc: null
                        }
                    });
                }
                userServices.comparePassword(password, user.password, (err, isMatch) => {
                    if (err) res.status(500).json({
                        code: res.statusCode,
                        results: {
                            message: 'err: ' + err,
                            doc: null
                        }
                    });
                    if (isMatch) {
                        //check user 
                        var token = jwt.sign({ id: user.id }, mockinfo.secret_user, {
                            expiresIn: '12h', // one house
                            algorithm: 'HS256'
                        });
                        res.status(200).json({
                            code: res.statusCode,
                            results: {
                                message: null,
                                doc: {
                                    success: true,
                                    token: 'JWT ' + token,
                                }
                            }
                        });
                    }
                    else {
                        console.log(user.password);
                        return res.status(200).json({
                            code: res.statusCode,
                            results: {
                                message: 'Authentication failed. Passwords did not match!',
                                doc: {
                                    success: false
                                }
                            }
                        });
                    }
                });
            });
        }
    }

}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = mockinfo.secret_user; // wanring
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log(jwt_payload);
    userServices.findUser(jwt_payload.id, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    });
}));
