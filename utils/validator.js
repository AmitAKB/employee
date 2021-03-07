(function () {
  'use strict';

  var jwt = require('jsonwebtoken');
  var UserModel = require('../api/schema/users.js');
  var _CONST = require('../config/resources.js');

  // validator functions
  module.exports = {
    isDefined: isDefined,
    defineObject: defineObject,
    isValidObject: isValidObject,
    isJSON: isJSON,
    isEmail: isEmail,
    isPhoneNumber: isPhoneNumber,
    isZipCode: isZipCode,
    isValidName: isValidName,
    isMongoErr: isMongoErr,
    isValidUser: isValidUser,
    random: random,
    isArray: isArray,
  };


  /* @function : isDefined
   * @param    : data {string}
   * @purpose  : To validate provided data
   * @return   : true or false
   * @public   
   */
  function isDefined(key) {
    return typeof key !== 'undefined';
  }


  /* @function : defineObject
   * @param    : data {string}
   * @purpose  : To generate query object
   * @return   : true or false
   * @public   : ($or=type?regular^type?follow_up,date=$lte?100~$gte?10,type=$in?,name=demo)
   */
  function defineObject(query) {
    // Query reader between brackets
    var init = query.indexOf('(');
    var fin = query.indexOf(')');
    var queries = query.substr(init + 1, fin - init - 1);
    queries = queries.split(",");

    // create query string
    var _tempArr = {};
    queries.forEach(function (query) {
      var _key = query.split('=');
      _tempArr[_key[0]] = generateQueryStr(_key[0], _key[1]);
    });
    return _tempArr;
  }

  // Generate operators query string
  function generateQueryStr(key, value) {
    // query string for $or & $and
    var _value = (value && value.indexOf('^') !== -1) ? value.split('^') : value;
    if (Array.isArray(_value)) {
      var _arr = _value.map(function (i) {
        var _temp = i.split('?');
        return createJSONProperty(_temp);
      });
      return _arr;
    } else {
      // query string for $lte, $lt, $gte, $gt
      var _value = (value && value.indexOf('~') !== -1) ? value.split('~') : value;
      if (Array.isArray(_value)) {
        var _json = {};
        _value.forEach(function (i, index) {
          var _temp = i.split('?');
          _json[_temp[0]] = _temp[1];
        });
        return _json;
      } else {
        // query string for $in
        var _value = (value && value.indexOf('?') !== -1) ? value.split('?') : value;
        if (Array.isArray(_value)) {
          var _json = {};
          var _arr = _value[1].split('&');
          _json[_value[0]] = _arr;
          return _json;
        } else {
          return value;
        }
      }
    }
  }

  // create key from input string
  function createJSONProperty(_arr) {
    var _json = {};
    _json[_arr[0]] = _arr[1];
    return _json;
  }

  /* @function : isValidObject
   * @param    : _Object {object}
   * @purpose  : To validate provided data
   * @return   : 401 or 401 or 200
   * @public   
   */
  function isValidObject(_Object) {
    if (isJSON(_Object)) {
      for (var obj in _Object) {
        if (isJSON(_Object[obj])) {
          for (var _arr in _Object[obj]) {
            if (_Object[obj][_arr] === null || _Object[obj][_arr] === '')
              delete _Object[obj][_arr];
          }
          if (!isJSON(_Object[obj]))
            delete _Object[obj];
        } else {
          if (_Object[obj] === null || _Object[obj] === '')
            delete _Object[obj];
          if (Array.isArray(_Object[obj]) && _Object[obj].length == 0)
            delete _Object[obj];
        }
      }
    }
    return _Object;
  }

  function isJSON(_obj) {
    var _has_keys = 0;
    _obj = JSON.parse(JSON.stringify(_obj)); // issue with hasOwnProperty... so parsed json
    for (var _pr in _obj) {
      if (_obj.hasOwnProperty(_pr) && !(/^\d+$/.test(_pr))) {
        _has_keys = 1;
        break;
      }
    }
    return (_has_keys && _obj.constructor == Object && _obj.constructor != Array) ? 1 : 0;
  }

  /* @function : isEmail
   * @param    : Email
   * @purpose  : To validate email and return status
   * @return   : Status : true, false
   * @public   
   */
  function isEmail(email) {
    return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(email);
  }

  /* @function : isPhoneNumber
  * @param    : Phone Number
  * @purpose  : To validate phone number and return status
  * @return   : Status : true, false
  * @public   
  */
  function isPhoneNumber(phone) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
  }

  /* @function : isZipCode
   * @param    : zipcode
   * @purpose  : To validate zipcode
   * @return   : true, false
   * @public   
   */
  function isZipCode(zipcode) {
    return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
  }

  /* @function : isValidName
   * @param    : Name
   * @purpose  : To validate name
   * @return   : true, false
   * @public   
   */
  function isValidName(name) {
    return /^[a-zA-Z\s]*$/.test(name);
  }

  /* @function : isMongoErr
   * @param    : Name
   * @purpose  : To return mongodb error message
   * @return   : message
   * @public   
   */
  function isMongoErr(_Obj) {
    if (_Obj && _Obj.errors) {
      var key = Object.keys(_Obj.errors)[0];
      return _Obj.errors[key].message;
    } else {
      return _Obj.message;
    }
  }

  /* @function : isValidUser
   * @param    : Token
   * @purpose  : To return token verification data
   * @return   : message
   * @public   
   */
  function isValidUser(req, callback) {
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      var _id = req.swagger.params.user_id.value;
      jwt.verify(parts[1], _CONST.privateKey, function (err, verifyUser) {
        if (err) {
          return callback(err.message);
        } else if(verifyUser) {
          UserModel.findOne({ _id: verifyUser.id })
          .exec(function (err, user) {
            if (err) {
              return callback(err.message);
            } else if(user) {
              return callback(null, verifyUser);
            } else {
              return callback("User is not authorized!");
            }
          });
        } else{
          return callback("User is not authorized!");
        }
      });
    } else {
      return callback(true, null);
    }
  }

  /* @function : random
   * @param    : generate random tsring
   * @purpose  : Return random string for password
   * @return   : string
   * @public   
   */
  function random(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // random text
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  /* @function : isArray
   * @param    : check value is array or not
   * @purpose  : Return boolean value
   * @return   : boolean
   * @public   
   */
  function isArray(_arr) {
    return Array.isArray(_arr);
  }

})