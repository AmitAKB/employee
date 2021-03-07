'use strict';

var jwt = require('jsonwebtoken');
var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');

// Exports all users services
module.exports = {
	authenticate: authenticate,
	status: status,
	me: me,
	logout: logout,
};

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate
 */
function authenticate(data, callback) {
	UserModel.findOne({ email: data.email.value, type: data.type.value }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				// check for password and status of user
				if (result.campareHash(data.password.value) && result.status && (!result.is_deleted)) {
					var token = jwt.sign({ 'id': result.id, 'type': result.type }, _CONST.privateKey );//, { 'expiresIn': '30d' }); due multiple login
					result.token = token;
					result.save(function (err) {
						if (err) {
							return callback(Validator.isMongoErr(err));
						} else {
							jwt.verify(token, _CONST.privateKey, function (err, user) {
								if (err) {
									return callback(err.message);
								} else {
									return callback(null, { 'token': token, 'iat': user.iat, 'exp': user.exp, 'id': result._id  });
								}
							});
						}
					});
				} else {
					var msg = (result.status) ? "Authentication Failed! Please check your password." : "Your account is inactive.";
					return callback(msg);
				}
			} else {
				return callback("Authentication Failed! User is not found!");
			}
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function status(type, auth, callback) {
	checkUserStatus(type, auth, function (err, result) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, result);
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function me(type, auth, callback) {
	checkUserStatus(type, auth, function (err, result) {
		if (err) {
			return callback(err);
		} else {
			return callback(null, result);
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 * @api /api/v1/authenticate/me
 */
function logout(type, auth, callback) {
	jwt.verify(auth, _CONST.privateKey, function (err, user) {
		if (err) {
			return callback(err.message);
		} else {
			UserModel.update({ _id: user.id }, { $set: { 'token': undefined } })
				.exec(function (err) {
					if (err) {
						return callback(err.message);
					} else {
						return callback(null, false);
					}
				});
		}
	});
}

/**
 * Authenticate user
 *
 * @param {Schema} Auth data
 * @param {Object obj Object to cast}
 */

function checkUserStatus(type, auth, callback) {
	UserModel.findOne({ token: auth })
		.exec(function (err, user) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				if (user) {
					jwt.verify(user.token, _CONST.privateKey, function (err, user) {
						if (err) {
							return callback(err.message);
						} else {
							return callback(null, user);
						}
					});
				} else {
					return callback("User is not authorized!");
				}
			}
		});
}