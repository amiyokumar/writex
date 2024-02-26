const Department = require('../../../models/department');
const apiUtils = require('../apiUtils');

const apiDepartments = {};

apiDepartments.get = async (req, res) => {
  try {
    const departments = await Department.find({});

    return apiUtils.sendApiSuccess(res, { departments });
  } catch (err) {
    return apiUtils.sendApiError(res, 500, err.message);
  }
};

apiDepartments.create = async (req, res) => {
  const postData = req.body;
  if (!postData) return apiUtils.sendApiError_InvalidPostData(res);

  if (!postData.teams) postData.teams = [];
  if (!postData.groups) postData.groups = [];

  try {
    const createdDepartment = await Department.create(postData);
    if (!createdDepartment) return apiUtils.sendApiError(res, 500, 'Unable to create department');

    const populatedDepartment = await createdDepartment.populate('teams groups');

    return apiUtils.sendApiSuccess(res, { department: populatedDepartment });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

apiDepartments.update = async (req, res) => {
  const putData = req.body;
  const id = req.params.id;
  if (!putData || !id) return apiUtils.sendApiError_InvalidPostData(res);

  if (!putData.teams) putData.teams = [];
  if (!putData.groups) putData.groups = [];
  if (putData.allGroups) putData.groups = [];

  try {
    let department = await Department.findOneAndUpdate({ _id: id }, putData, { new: true });
    department = await department.populate('teams groups');

    return apiUtils.sendApiSuccess(res, { department });
  } catch (e) {
    return apiUtils.sendApiError(res, 500, e.message);
  }
};

apiDepartments.delete = async (req, res) => {
  const id = req.params.id;
  if (!id) return apiUtils.sendApiError_InvalidPostData(res);

  try {
    const success = await Department.deleteOne({ _id: id });
    if (!success) return apiUtils.sendApiError(res, 500, 'Unable to delete department');

    return apiUtils.sendApiSuccess(res);
  } catch (err) {
    return apiUtils.sendApiError(res, 500, err.message);
  }
};

module.exports = apiDepartments;
