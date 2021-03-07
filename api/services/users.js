'use strict';

var UserModel = require('../schema/users.js');
var Validator = require('../../utils/validator.js');
var _USER_KEYS = 'first_name last_name type email';
// Exports all users services
module.exports = {
	getUsers: getUsers,  // Get all users listing
	addUsers: addUsers,   // add new user into database
	deleteUserById: deleteUserById, // delete individual user
	getUserById: getUserById, // Get individual user info
	updateUserById: updateUserById // Update user info
};


/**
 * Add new user into medizener
 *
 * @param {Schema} User Schema
 * @param {Object obj Object to cast}
 * @api /api/v1/users
 */
function addUsers(data, callback) {
	var host =  data.host;
	delete data.host;
	var _record = new UserModel(data);
	UserModel.findOne({ 'email': _record.email }, function (err, result) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			if (result) {
				return callback('User already exists. Click Login to continue.');
			} else {
				_record.password = _record.generateHash(_record.password);
				_record.save(function (err) {
					if (err) {
						return callback(Validator.isMongoErr(err));
					} else {
						return callback(null, 'Registration Complete! Please check your email account to verify.', _record._id);
					}
				});
			}
		}
	});
}
/**
 * Get users queries
 *
 * @param Users schema
 * @param Query params 
 * @api /api/v1/users
 */
function getUsers(params, callback) {
	UserModel.find(params.query, params.fields)
		.limit(params.limit)
		.sort(params.sort)
		.skip(params.skip)
		.populate('user_id', _USER_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Handles individual user queries
 *
 * @param Users schema
 * @param query object
 * @api GET /api/v1/users/{user_id}
 */
function getUserById(params, callback) {
	UserModel.findOne(params.query, params.fields)
		.populate('user_id', _USER_KEYS)
		.exec(function (err, result) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, result);
			}
		});
}

/**
 * Handles update operation
 *
 * @param Users schema
 * @param User object 
 * @api PUT /api/v1/users/{user_id}
 */
function updateUserById(params, callback) {
	if (params.action) {
		UserModel.findOne(params.query)
			.exec(function (err, result) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					if (result) {
						switch (params.action) {
							case 'password': {
								if (result.campareHash(params.body.old_password)) {
									UserModel.update(params.query, { $set: { 'password': result.generateHash(params.body.new_password) } })
										.exec(function (err) {
											if (err) {
												return callback(Validator.isMongoErr(err));
											} else {
												return callback(null, 'Password is updated successfully.');
											}
										});
								} else {
									return callback('Incorrect Password! Please enter correct password.');
								}
								break;
							}
							default: {
								return callback('Invalid action value.');
							}
						}
					} else {
						return callback('User is not found.');
					}
				}
			});
	} else {
		UserModel.update(params.query, params.set)
			.exec(function (err) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					return callback(null, 'User is updated successfully.');
				}
			});
	}
}

/**
 * Handles delete operation
 *
 * @param id of user
 * @param return result message
 * @api DELETE /api/v1/users/{user_id}
 */
function deleteUserById(_id, callback) {
	UserModel.update({ '_id': _id }, { $set: { 'is_deleted': true } })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'User is deleted successfully.');
			}
		});
}