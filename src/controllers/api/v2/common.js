const User = require('../../../models/user');
const apiUtils = require('../apiUtils');

const commonV2 = {};

commonV2.login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) return apiUtils.sendApiError_InvalidPostData(res);

  try {
    const user = await User.getUserByUsername(username);
    if (!user) return apiUtils.sendApiError(res, 401, 'Invalid Username/Password');

    if (!User.validate(password, user.password)) return apiUtils.sendApiError(res, 401, 'Invalid Username/Password');

    const tokens = await apiUtils.generateJWTToken(user);

    return apiUtils.sendApiSuccess(res, { token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

commonV2.token = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return apiUtils.sendApiError_InvalidPostData(res);

  try {
    const user = await User.getUserByAccessToken(refreshToken);
    if (!user) return apiUtils.sendApiError(res, 401);

    const tokens = await apiUtils.generateJWTToken(user);

    return apiUtils.sendApiSuccess(res, { token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

commonV2.viewData = async (req, res) => {
  return apiUtils.sendApiSuccess(res, { viewdata: req.viewdata });
};

module.exports = commonV2;
