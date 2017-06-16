var express = require('express'),
    errHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser');
var mockinfo = require('./mockinfo');

var mongoose = require('mongoose');

module.exports = function (app) {
    /**connect to mongoose */
    // configure connect to mongodb database
    mongoose.Promise = global.Promise;
    // url connect to port of mongo server
    mongoose.connect(mockinfo.dbname);
    // On connection
    mongoose.connection.on('connected', (err, res)=>{
        if(err) {
            console.log(err);
            throw err;
        }
        console.log('Connected to databse: ' + mockinfo.dbname);
    });
    // Open database
    mongoose.connection.on('open', ()=>{
        console.log('Mongoose connected! ........');
    });
    // On err Mongoose
    mongoose.connection.on('error', (err)=>{
        console.log('Database error: '+ err);
    })
    //body parser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(methodOverride());

    if ('development' === app.get('env')) {
        app.use(errHandler());
    }
    return app;
}