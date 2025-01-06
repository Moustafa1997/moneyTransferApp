'use strict';
const Role = require('../../models').roles;
const RolePermission = require('../../models').role_permissions;
const Permission = require('../../models').permissions;
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');

exports.getPermissions = async (req, res) => {
  try {
    const permissionsWithRoles = await Permission.findAll({
      include: [
        {
          model: RolePermission,
          include: [
            {
              model: Role,
              attributes: ['id', 'role', 'roleTitle']
            }
          ],
          attributes: ['id', 'roleId', 'permissionId']
        }
      ]
    });

    return sendSuccessResponse(res, 'Permissions fetched successfully.', permissionsWithRoles);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const { roleId, permissionId, isGiving } = req.body;
    const role = await Role.findOne({ where: { id: roleId } });
    if (!role) {
      return sendFailResponse(res, 'Role not found.', 400);
    }
    const permission = await Permission.findOne({ where: { id: permissionId } });
    if (!permission) {
      return sendFailResponse(res, 'Permission not found.', 400);
    }
    const rolePermission = await RolePermission.findOne({ where: { roleId, permissionId } });
    if (isGiving) {
      if (rolePermission) {
        return sendFailResponse(res, 'Permission already given.', 400);
      }
      await RolePermission.create({ roleId, permissionId });
      return sendSuccessResponse(res, 'Permission added successfully.');
    } else {
      if (!rolePermission) {
        return sendFailResponse(res, 'Permission not found.', 400);
      }
      await RolePermission.destroy({ where: { roleId, permissionId } });
      return sendSuccessResponse(res, 'Permission removed successfully.');
    }
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
