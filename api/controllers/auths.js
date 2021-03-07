'use strict';

var AuthService = require('../services/auths.js');
var Validator = require('../../utils/validator.js');

// Exports all users controller
module.exports = {
	authenticate: authenticate
};

/**
 * Handles auth operation
 *
 * @param email and password of user
 * @param return result data
 * @api GET /api/v1/authenticate
 */
function authenticate(req, res) {
	var _data = req.swagger.params;
	if (Validator.isJSON(_data) && Validator.isDefined(_data.email.value) && Validator.isDefined(_data.password.value) && Validator.isDefined(_data.type.value)) {
		AuthService.authenticate(_data, function (err, result) {
			if (err) {
				res.jsonp({ "code": 401, "message": err }).status(401);
			} else {
				res.jsonp({ "code": 200, "message": "Authentication Success!", "data": result }).status(200);
			}
		});
	} else {
		res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
	}
}