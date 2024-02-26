var _ = require('lodash');
var async = require('async');
var userSchema = require('../../../models/user');
var permissions = require('../../../permissions');
const socketEventConsts = require('../../../socketio/socketEventConsts');

var rolesV1 = {};

rolesV1.get = function (req, res) {
  var roleSchmea = require('../../../models/role');
  var roleOrderSchema = require('../../../models/roleorder');

  var roles = [];
  var roleOrder = {};

  async.parallel(
    [
      function (done) {
        roleSchmea.find({}, function (err, r) {
          if (err) return done(err);

          roles = r;

          return done();
        });
      },
      function (done) {
        roleOrderSchema.getOrder(function (err, ro) {
          if (err) return done(err);

          roleOrder = ro;

          return done();
        });
      },
    ],
    function (err) {
      if (err) return res.status(400).json({ success: false, error: err });

      return res.json({ success: true, roles: roles, roleOrder: roleOrder });
    }
  );
};

rolesV1.create = function (req, res) {
  var name = req.body.name;
  if (!name) return res.status(400).json({ success: false, error: 'Invalid Post Data' });

  var roleSchema = require('../../../models/role');
  var roleOrder = require('../../../models/roleorder');

  async.waterfall(
    [
      function (next) {
        roleSchema.create({ name: name }, next);
      },
      function (role, next) {
        if (!role) return next('Invalid Role');

        roleOrder.getOrder(function (err, ro) {
          if (err) return next(err);

          ro.order.push(role._id);

          ro.save(function (err, savedRo) {
            if (err) return next(err);

            return next(null, role, savedRo);
          });
        });
      },
    ],
    function (err, role, roleOrder) {
      if (err) return res.status(400).json({ success: false, error: err });

      global.roleOrder = roleOrder;
      global.roles.push(role);

      return res.json({ success: true, role: role, roleOrder: roleOrder });
    }
  );
};

rolesV1.update = function (req, res) {
  var _id = req.params.id;
  var data = req.body;
  if (_.isUndefined(_id) || _.isUndefined(data))
    return res.status(400).json({ success: false, error: 'Invalid Post Data' });

  var emitter = require('../../../emitter');
  var hierarchy = data.hierarchy ? data.hierarchy : false;
  var cleaned = _.omit(data, ['_id', 'hierarchy']);
  var k = permissions.buildGrants(cleaned);
  var roleSchema = require('../../../models/role');
  roleSchema.get(data._id, function (err, role) {
    if (err) return res.status(400).json({ success: false, error: err });
    role.updateGrantsAndHierarchy(k, hierarchy, function (err) {
      if (err) return res.status(400).json({ success: false, error: err });

      emitter.emit(socketEventConsts.ROLES_FLUSH);

      return res.send('OK');
    });
  });
};

rolesV1.delete = function (req, res) {
  var _id = req.params.id;
  var newRoleId = req.body.newRoleId;
  if (!_id || !newRoleId) return res.status(400).json({ success: false, error: 'Invalid Post Data' });

  var roleSchema = require('../../../models/role');
  var roleOrderSchema = require('../../../models/roleorder');

  async.series(
    [
      function (done) {
        userSchema.updateMany({ role: _id }, { $set: { role: newRoleId } }, done);
      },
      function (done) {
        roleSchema.deleteOne({ _id: _id }, done);
      },
      function (done) {
        roleOrderSchema.getOrder(function (err, ro) {
          if (err) return done(err);

          ro.removeFromOrder(_id, done);
        });
      },
    ],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err });

      permissions.register(function (err) {
        if (err) return res.status(500).json({ success: false, error: err });

        return res.json({ success: true });
      });
    }
  );
};

module.exports = rolesV1;
