/*
   
 *  Updated:    1/15/20, 1:23 AM
 *  Copyright (c) 2014-2020 Trudesk, Inc. All rights reserved.
 */
var mailCheck = require('../../../mailer/mailCheck');
var apiUtils = require('../apiUtils');

var mailerApi = {};

mailerApi.check = function (req, res) {
  mailCheck.refetch();
  return apiUtils.sendApiSuccess(res);
};

module.exports = mailerApi;
