(function () {
  "use strict";

  var RoleRequirementError, RoleMgr;

  RoleRequirementError =  Object.create(Error);

  RoleRequirementError.init = function init() {
    this.name = 'RoleRequirementError';
    this.message = msg || 'Missing Required Role';
  };

  RoleMgr = {};

  RoleMgr.checkRequirements = function checkRequirements(requirements, obj) {
    var hasRequirement, indexer, len;
      for (indexer = 0, len = requirements.length; indexer < len; indexer += 1) {
	if (obj.hasOwnProperty(requirements[indexer])) {
          hasRequirement = true;
        } else {
          hasRequirement = false;
          break;
        }
      }
      return hasRequirement;
    };

  RoleMgr.hasRequirements = function hasRoleRequirements(role, obj) {
      var requirements;
      if (this.hasOwnProperty('roleRequirements')) {
        requirements = this.roleRequirements();
        return this.checkRequirements(requirements, obj);
      }
      return true;
    };

  RoleMgr.assignRole = function assignRole(role, obj) {
      var methods;
      if (this.hasRequirements(role, obj)) {
	methods = Object.getOwnPropertyNames(role);
	methods.map(function (method) {
	  obj[method] = role[method];
	});
      } else {
	  err = Object.create(RoleRequirementError);
          err.init();
          throw err;
      }
    };

  RoleMgr.removeRole = function removeRole(role, obj) {
      var methods = Object.getOwnPropertyNames(role);
      methods.map(function (method) {
        delete obj[method];
      });
    };

  module.exports = { RoleRequirementError: RoleRequirementError,
    RoleMgr: RoleMgr
  };
})();
