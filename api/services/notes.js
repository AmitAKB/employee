'use strict';

var NotesModel = require('../schema/notes.js');
var Validator = require('../../utils/validator.js');
var request = require('request');

var _USER_KEYS = 'first_name last_name type email';
// Exports all notes services
module.exports = {
	getNotes: getNotes,  // Get all notes listing
	addNotes: addNotes,   // add new notes into database
	deleteNotesById: deleteNotesById, // delete individual notes
	getNotesById: getNotesById, // Get individual notes info
	updateNotesById: updateNotesById // Update notes info
};

/**
 * Add new notes
 *
 * @param {Schema} notes Schema
 * @param {Object obj Object to cast}
 * @api /api/v1/notes
 */
function addNotes(data, callback) {
	var _record = new NotesModel(data);
	// Save new record
	_record.save(function (err) {
		if (err) {
			return callback(Validator.isMongoErr(err));
		} else {
			return callback(null, 'Notes successfully added.', _record._id);
		}
	});
}

/**
 * Get notes queries
 *
 * @param notes schema
 * @param Query params 
 * @api /api/v1/notes
 */
function getNotes(params, callback) {
	NotesModel.find(params.query, params.fields)
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
 * Handles individual notes queries
 *
 * @param notes schema
 * @param query object
 * @api GET /api/v1/notes/{notes_id}
 */
function getNotesById(params, callback) {
	NotesModel.findOne(params.query, params.fields)
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
 * @param notes schema
 * @param notes object 
 * @api PUT /api/v1/notes/{notes_id}
 */
function updateNotesById(params, callback) {
	NotesModel.update(params.query, params.set)
			.exec(function (err) {
				if (err) {
					return callback(Validator.isMongoErr(err));
				} else {
					return callback(null, 'Notes is updated successfully.');
				}
			});
}

/**
 * Handles delete operation
 *
 * @param id of notes
 * @param return result message
 * @api DELETE /api/v1/notes/{notes_id}
 */
function deleteNotesById(query, callback) {
	NotesModel.update(query, { $set: { 'is_deleted': true } })
		.exec(function (err) {
			if (err) {
				return callback(Validator.isMongoErr(err));
			} else {
				return callback(null, 'Notes is deleted successfully.');
			}
		});
}

