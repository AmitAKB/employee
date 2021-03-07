'use strict';

var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var SwaggerExpress = require('swagger-express-mw');
var Agendash = require('agendash');
var express = require('express');
var basicAuth = require('express-basic-auth');
var path = require('path');
var app = express();
var db = require('./config/db');
var port = process.env.API_PORT || 8888;
var config = {
	appRoot: __dirname // required config
};

SwaggerExpress.create(config, function (err, swaggerExpress) {
	if (err) { throw err; }

	// basic authentication for swagger ui
	app.use('/docs', basicAuth({ users: { 'amit': 'amit' }, challenge: true }));
	
	// set root path of application
	app.use(express.static(path.join(__dirname, '/assets')));
	app.use(SwaggerUi(swaggerExpress.runner.swagger));

	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
  	// Allow CROS and set response headers
  	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept');
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Max-Age', 60);
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		next();
	});

	// install middleware
	// swaggerExpress.register(app);
	app.listen(port); // Listent on port 10010
	https.createServer(options, app)
	// app.listen(port, function () {
	// 	console.log('Server started '+app+'!');
	// });
});

module.exports = app;