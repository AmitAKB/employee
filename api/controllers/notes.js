//  specific user'use strict';

var NotesService = require('../services/notes.js');
var Validator = require('../../utils/validator.js');

// Exports all Notes controller 
module.exports = {
  // All Notes information
  getNotes: getNotes,
  addNotes: addNotes,
  // Individual Notes controller
  getNotesById: getNotesById,
  updateNotesById: updateNotesById,
  deleteNotesById: deleteNotesById
};

/**
 * Add new notes into medizener
 *
 * @param Notes Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/notes
 */
function addNotes(req, res) {
  if (Validator.isValidObject(req.body)) {
    NotesService.addNotes(req.body, function (err, result, id ) {
      if (err) {
        res.jsonp({ "code": 401, "message": err }).status(401);
      } else {
        res.jsonp({ "code": 200, "message": result, id: id }).status(200);
      }
    });
  } else {
    res.jsonp({ "code": 401, "message": "Required attributes are missing." });
  }
}

/**
 * Get notes queries
 *
 * @param notes schema
 * @param Query params 
 * @api GET /api/v1/notes
 */
function getNotes(req, res) {
  var query = req.swagger.params.query.value || '()';
  var action = req.swagger.params.action.value || null;
  var field = req.swagger.params.field.value || null;
  var limit = req.swagger.params.limit.value || 20;
  var sort = req.swagger.params.sort.value || '(created=1,_id=1)';
  var skip = req.swagger.params.skip.value || 0;
  var _queries = Validator.defineObject(query); // query object
  var _sorts = Validator.defineObject(sort);  // sorting object
  // create fields array
  var _fields = {};
  if (field) {
    var _arr = field.split(',');
    _arr.forEach(function (arr) {
      _fields[arr] = 1;
    });
  } 
  var params = {
    query: _queries,
    fields: _fields,
    limit: limit,
    sort: _sorts,
    skip: skip,
    action: action
  };
  // Get all notes information
  NotesService.getNotes(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result.data, "count": result.data.length, "totalcount": result.total }).status(200);
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
function getNotesById(req, res) {
  //Validate user authorization
  Validator.isValidUser(req, function (err, verifiedUser) {
    if (err) {
      res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
    } else {
      var field = req.swagger.params.field.value || null;
      var _id   = req.swagger.params.notes_id.value;
      var user_id = verifiedUser.id;

      var _queries = {}; // query object
      _queries._id = _id;
      // create fields array
      var _fields = {};
      if (field) {
        var _arr = field.split(',');
        _arr.forEach(function (arr) {
          _fields[arr] = 1;
        });
      }

      // params object for db query
      var params = {
        query: _queries,
        fields: _fields
      };
      // Get individual notes information
      NotesService.getNotesById(params, function (err, result) {
        if (err) {
          res.jsonp({ "code": 401, "message": err }).status(401);
        } else {
          res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result }).status(200);
        }
      });
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
function updateNotesById(req, res) {
  // Validate user authorization
  Validator.isValidUser(req, function (err, verifiedUser) {
    if (err) {
      res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
    } else {
      var _id = req.swagger.params.notes_id.value;
      var user_id = verifiedUser.id;
      var query = req.swagger.params.query.value || '()';
      var action = req.swagger.params.action.value || 'all';

      var _queries = Validator.defineObject(query); // query object
      _queries._id = _id;

      var _data = req.body;
      var params = {};
      _data.modified = new Date();
      params.query = _queries;
      params.user_id = user_id;
      params.set = { $set: _data };
      params.flag = _data;
      params.host = req.headers.origin;
      updateRecord(req, res, params);
    }
  });
}

// Update notes information
function updateRecord(req, res, params) {
  NotesService.updateNotesById(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": result }).status(200);
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
function deleteNotesById(req, res) {
  Validator.isValidUser(req, function (err, verifiedUser) {
    if (err) {
      res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
    } else if(req.swagger.params.notes_id && req.swagger.params.notes_id.value && req.swagger.params.notes_id.value!="undefined" && verifiedUser.id) {
      var _id = req.swagger.params.notes_id.value;
      var user_id = verifiedUser.id;
      var query = {
        _id: _id,
        user_id: user_id
      }
      // Delete individual notes information
      NotesService.deleteNotesById(query, function (err, result) {
        if (err) {
          res.jsonp({ "code": 401, "message": err }).status(401);
        } else {
          res.jsonp({ "code": 200, "message": result }).status(200);
        }
      });
    } else{
      res.jsonp({ "code": 401, "message": "Required field is missing." }).status(401);
    }
  });
}

