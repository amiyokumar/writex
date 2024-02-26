var _ = require('lodash');
var async = require('async');
var Team = require('../../../models/team');
const DepartmentSchema = require('../../../models/department');
var apiUtils = require('../apiUtils');

var apiTeams = {};

apiTeams.get = function (req, res) {
  var limit = 10;
  if (!_.isUndefined(req.query.limit)) {
    try {
      limit = parseInt(req.query.limit);
    } catch (err) {
      limit = 10;
    }
  }

  var page = 0;
  if (req.query.page) {
    try {
      page = parseInt(req.query.page);
    } catch (err) {
      page = 0;
    }
  }

  var obj = {
    limit: limit,
    page: page,
  };

  Team.getWithObject(obj, function (err, results) {
    if (err) return apiUtils.sendApiError(res, 400, err.message);

    return apiUtils.sendApiSuccess(res, { count: results.length, teams: results });
  });
};

apiTeams.create = function (req, res) {
  var postData = req.body;
  if (!postData) return apiUtils.sendApiError_InvalidPostData(res);

  Team.create(postData, function (err, team) {
    if (err) return apiUtils.sendApiError(res, 500, err.message);

    team.populate('members', function (err, team) {
      if (err) return apiUtils.sendApiError(res, 500, err.message);

      return apiUtils.sendApiSuccess(res, { team: team });
    });
  });
};

apiTeams.update = function (req, res) {
  var id = req.params.id;
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Team Id');

  var putData = req.body;
  if (!putData) return apiUtils.sendApiError_InvalidPostData(res);

  Team.findOne({ _id: id }, function (err, team) {
    if (err || !team) return apiUtils.sendApiError(res, 400, 'Invalid Team');

    if (putData.name) team.name = putData.name;
    if (putData.members) team.members = putData.members;

    team.save(function (err, team) {
      if (err) return apiUtils.sendApiError(res, 500, err.message);

      team.populate('members', function (err, team) {
        if (err) return apiUtils.sendApiError(res, 500, err.message);

        return apiUtils.sendApiSuccess(res, { team: team });
      });
    });
  });
};

apiTeams.delete = function (req, res) {
  var id = req.params.id;
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Team Id');

  Team.deleteOne({ _id: id }, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 500, err.message);
    if (!success) return apiUtils.sendApiError(res, 500, 'Unable to delete team. Contact your administrator.');

    return apiUtils.sendApiSuccess(res, { _id: id });
  });
};

apiTeams.getGroupTeams = function (req, res) {
  var groupId = req.params.gid;
  if (!groupId) return apiUtils.sendApiError(res, 400, 'Invalid Team Id');

  DepartmentSchema.getDepartmentTeamsByGroup(groupId, function (err, results) {
    if (err) return apiUtils.sendApiError(res, 400, err.message);
    const teams = [];
    results.forEach((result) => {
      result.teams.forEach((team) => {
        if (!teams.includes(team)) teams.push({ _id: team._id, name: team.name });
      });
    });

    return apiUtils.sendApiSuccess(res, { teams: teams });
  });
};

module.exports = apiTeams;
