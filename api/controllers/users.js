'use strict';

var UserService = require('../services/users.js');
var Validator = require('../../utils/validator.js');

// Exports all users controller 
module.exports = {
  // All users information
  getUsers: getUsers,
  addUsers: addUsers,
  // Individual users controller
  getUserById: getUserById,
  updateUserById: updateUserById,
  deleteUserById: deleteUserById
};

/**
 * Add new user into medizener
 *
 * @param Users Schema
 * @param {Object obj Object to cast}
 * @api POST /api/v1/users
 */
function addUsers(req, res) {
  console.log(req.body)
  // Validate user request
  if (Validator.isValidObject(req.body)) {
    UserService.addUsers(req.body, function (err, result, id) {
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
 * Get users queries
 *
 * @param Users schema
 * @param Query params 
 * @api GET /api/v1/users
 */
function getUsers(req, res) {
  var query = req.swagger.params.query.value || '()';
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

  // params object for db query
  var params = {
    query: _queries,
    fields: _fields,
    limit: limit,
    sort: _sorts,
    skip: skip
  };

  // Get all users information
  UserService.getUsers(params, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": "Record is fetched successfully.", "data": result, "count": result.length }).status(200);
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
function getUserById(req, res) {
  // Validate user authorization
  Validator.isValidUser(req, function (err, verifiedUser) {
    if (err) {
      res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
    } else {
      var field = req.swagger.params.field.value || null;
      var _id = verifiedUser.id;

      var _queries = {}; // query object
      _queries._id = _id;
      _queries.is_deleted = false;

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

      // Get individual users information
      UserService.getUserById(params, function (err, result) {
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
 * @param Users schema
 * @param User object 
 * @api PUT /api/v1/users/{user_id}
 */
function updateUserById(req, res) {
  // Validate user authorization
  Validator.isValidUser(req, function (err, verifiedUser) {
    if (err) {
      res.jsonp({ "code": 401, "message": "Unauthorized access!" }).status(401);
    } else {
      var _id = verifiedUser.id;
      var query = req.swagger.params.query.value || '()';
      var action = req.swagger.params.action.value || 'all';

      var _queries = Validator.defineObject(query); // query object
      _queries._id = _id;

      // Validate user request
      if (req.body) {
        var _data = req.body;
        (Validator.isDefined(_data.email)) ? delete _data.email : _data.email;
        (Validator.isDefined(_data.username)) ? delete _data.username : _data.username;
        (Validator.isDefined(_data.type)) ? delete _data.type : _data.type;
        var params = {};
        _data.modified = new Date();
        params.query = _queries;
        switch (action) {
          case 'password': {
            if (Validator.isDefined(_data.old_password) && Validator.isDefined(_data.new_password)) {
              params.body = _data;
              params.action = 'password';
              updateRecord(req, res, params);
            } else {
              res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
            }
            break;
          }
          default: {
            params.set = { $set: _data };
            updateRecord(req, res, params);
          }
        }
      } else {
        res.jsonp({ "code": 401, "message": "Required attributes are missing." }).status(401);
      }
    }
  });
}

// Update user information
function updateRecord(req, res, params) {
  UserService.updateUserById(params, function (err, result) {
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
 * @param id of user
 * @param return result message
 * @api DELETE /api/v1/users/{user_id}
 */
function deleteUserById(req, res) {
  var _id = req.swagger.params.user_id.value;
  // Delete individual user information
  UserService.deleteUserById(_id, function (err, result) {
    if (err) {
      res.jsonp({ "code": 401, "message": err }).status(401);
    } else {
      res.jsonp({ "code": 200, "message": result }).status(200);
    }
  });
}