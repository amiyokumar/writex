const _ = require('lodash');

const apiUtils = {};

apiUtils.sendApiSuccess = function (res, object) {
  const sendObject = { success: true };
  const resObject = _.merge(sendObject, object);

  return res.json(resObject);
};

apiUtils.sendApiError = function (res, errorNum, error) {
  return res.status(errorNum).json({ success: false, error });
};
apiUtils.sendApiError_InvalidPostData = function (res) {
  return apiUtils.sendApiError(res, 400, 'Invalid Post Data');
};

apiUtils.generateJWTToken = function (dbUser, callback) {
  const nconf = require('nconf');
  const jwt = require('jsonwebtoken');

  const resUser = _.clone(dbUser._doc);
  const refreshToken = resUser.accessToken;
  delete resUser.resetPassExpire;
  delete resUser.resetPassHash;
  delete resUser.password;
  delete resUser.iOSDeviceTokens;
  delete resUser.tOTPKey;
  delete resUser.__v;
  delete resUser.preferences;
  delete resUser.accessToken;
  delete resUser.deleted;
  delete resUser.hasL2Auth;

  const secret = nconf.get('tokens') ? nconf.get('tokens').secret : false;
  const expires = nconf.get('tokens') ? nconf.get('tokens').expires : 3600;
  if (!secret || !expires) return callback({ message: 'Invalid Server Configuration' });

  require('../../models/group').getAllGroupsOfUserNoPopulate(dbUser._id, function (err, grps) {
    if (err) return callback(err);
    resUser.groups = grps.map(function (g) {
      return g._id;
    });

    const token = jwt.sign({ user: resUser }, secret, { expiresIn: expires });

    return callback(null, { token: token, refreshToken: refreshToken });
  });
};

apiUtils.stripUserFields = function (user) {
  user.password = undefined;
  user.accessToken = undefined;
  user.__v = undefined;
  user.tOTPKey = undefined;
  user.iOSDeviceTokens = undefined;

  return user;
};

module.exports = apiUtils;
