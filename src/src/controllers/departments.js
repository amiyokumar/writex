const _ = require('lodash');
const permissions = require('../permissions');
const Department = require('../models/department');

const departmentController = {};

departmentController.get = function (req, res) {
  const user = req.user;
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'departments:view')) {
    return res.redirect('/');
  }

  const content = {};
  content.title = 'Departments';
  content.nav = 'departments';

  content.data = {};
  content.data.user = req.user;
  content.data.common = req.viewdata;
  content.data.departments = {};

  return res.render('departments', content);
};

module.exports = departmentController;
