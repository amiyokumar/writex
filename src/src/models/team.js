/*
 *  Author:     Nawed Anjum
 *
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var utils = require('../helpers/utils');
const teamHierarchy = require('../settings/teamHierarchy');

// Refs
require('./user');

var COLLECTION = 'teams';

var teamSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  normalized: { type: String, required: true, unique: true, lowercase: true },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'accounts',
      autopopulate: { select: '-hasL2Auth -preferences -__v' },
    },
  ],
});

teamSchema.plugin(require('mongoose-autopopulate'));

teamSchema.pre('validate', function () {
  this.normalized = utils.sanitizeFieldPlainText(this.name.trim().toLowerCase());
});

teamSchema.pre('save', function (next) {
  this.name = utils.sanitizeFieldPlainText(this.name.trim());

  return next();
});

teamSchema.methods.addMember = async function (memberId, callback) {
  return new Promise((resolve, reject) => {
    (async () => {
      if (_.isUndefined(memberId)) {
        if (typeof callback === 'function') return callback({ message: 'Invalid MemberId - TeamSchema.AddMember()' });
        return reject(new Error('Invalid MemberId - TeamSchema.AddMember()'));
      }

      if (this.members === null) this.members = [];

      this.members.push(memberId);
      this.members = _.uniq(this.members);

      if (typeof callback === 'function') return callback(null, true);

      return resolve(true);
    })();
  });
};

teamSchema.methods.removeMember = function (memberId, callback) {
  return new Promise((resolve, reject) => {
    (async () => {
      if (_.isUndefined(memberId)) {
        if (typeof callback === 'function')
          return callback({ message: 'Invalid MemberId - TeamSchema.RemoveMember()' });
        return reject(new Error('Invalid MemberId - TeamSchema.RemoveMember()'));
      }

      if (!isMember(this.members, memberId)) {
        if (typeof callback === 'function') return callback(null, false);
        return reject(false);
      }
      this.members.splice(_.indexOf(this.members, _.find(this.members, { _id: memberId })), 1);
      this.members = _.uniq(this.members);

      if (typeof callback === 'function') return callback(null, true);

      return resolve(true);
    })();
  });
};

teamSchema.methods.isMember = function (memberId) {
  return isMember(this.members, memberId);
};

teamSchema.statics.getWithObject = function (obj, callback) {
  if (!obj) return callback({ message: 'Invalid Team Object - TeamSchema.GetWithObject()' });

  var q = this.model(COLLECTION)
    .find({})
    .skip(obj.limit * obj.page)
    .limit(obj.limit)
    .sort('name');

  return q.exec(callback);
};

teamSchema.statics.getTeamByName = function (name, callback) {
  if (_.isUndefined(name) || name.length < 1) return callback('Invalid Team Name - TeamSchema.GetTeamByName()');

  var q = this.model(COLLECTION).findOne({ normalized: name });

  return q.exec(callback);
};

teamSchema.statics.getTeams = function (callback) {
  var q = this.model(COLLECTION).find({}).sort('name');

  return q.exec(callback);
};

teamSchema.statics.getTeamsByIds = function (ids, callback) {
  return this.model(COLLECTION)
    .find({ _id: { $in: ids } })
    .sort('name')
    .exec(callback);
};

teamSchema.statics.getTeamsNoPopulate = function (callback) {
  var q = this.model(COLLECTION).find({}).sort('name');

  return q.exec(callback);
};

teamSchema.statics.getTeamsOfUser = function (userId, callback) {
  return new Promise((resolve, reject) => {
    (async () => {
      if (_.isUndefined(userId)) {
        if (typeof callback === 'function') callback('Invalid UserId - TeamSchema.GetTeamsOfUser()');
        return reject(new Error('Invalid UserId - TeamSchema.GetTeamsOfUser()'));
      }

      try {
        const q = this.model(COLLECTION).find({ members: userId }).sort('name');

        if (typeof callback === 'function') return q.exec(callback);

        const teams = await q.exec();

        return resolve(teams);
      } catch (error) {
        if (typeof callback === 'function') return callback(error);

        return reject(error);
      }
    })();
  });
};

teamSchema.statics.getTeamsOfUserNoPopulate = function (userId, callback) {
  if (_.isUndefined(userId)) return callback('Invalid UserId - TeamSchema.GetTeamsOfUserNoPopulate()');

  var q = this.model(COLLECTION).find({ members: userId }).sort('name');

  return q.exec(callback);
};

teamSchema.statics.getTeam = function (id, callback) {
  if (_.isUndefined(id)) return callback('Invalid TeamId - TeamSchema.GetTeam()');

  var q = this.model(COLLECTION).findOne({ _id: id });

  return q.exec(callback);
};

/**
 * NF: Logic to fetch team members on dropdown based on role
 *
 * @param {Object} teamId
 * @param {string} role
 * @param {function} callback
 */

teamSchema.statics.getAgentsOfTeamUnderRole = function (teamId, role, ticketType, callback) {
  if (_.isNull(teamId)) return callback(null, []);

  var q = this.model(COLLECTION).findOne({ _id: teamId }).populate('members', 'role');
  const rolesUnderCurrUser = teamHierarchy[role] ? teamHierarchy[role][ticketType] : [];

  q.exec(function (err, team) {
    if (err) return callback(err);
    const agentsUnderTeamForRole = _.filter(team.members, (user) => {
      return _.indexOf(rolesUnderCurrUser, user.role.normalized) !== -1;
    });
    return callback(null, agentsUnderTeamForRole);
  });
};

function isMember(arr, id) {
  var matches = _.filter(arr, function (value) {
    if (value._id.toString() === id.toString()) return value;
  });

  return matches.length > 0;
}

module.exports = mongoose.model(COLLECTION, teamSchema);
