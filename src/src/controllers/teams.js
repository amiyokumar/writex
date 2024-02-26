const _ = require('lodash');
const permissions = require('../permissions');
const Team = require('../models/team');

const teamController = {};

teamController.get = function (req, res) {
  const user = req.user;
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'teams:view')) {
    return res.redirect('/');
  }

  const content = {};
  content.title = 'Teams';
  content.nav = 'teams';

  content.data = {};
  content.data.user = req.user;
  content.data.common = req.viewdata;
  content.data.teams = {};

  return res.render('team', content);
};

module.exports = teamController;
