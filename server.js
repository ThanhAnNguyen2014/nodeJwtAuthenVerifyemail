var express = require('express'),
    router = express.Router();
var config = require('./config/config');
var routes = require('./config/router');

var app = express();

app.set('port', process.env.PORT || 3300);
app.set('views', __dirname + 'views');

app = config(app);

routes(app);


var server = app.listen(app.get('port'), function () {
    console.log('Server up: http://localhost:' + app.get('port'));
});