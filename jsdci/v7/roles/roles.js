(function () {
  "use strict";

  var RoleRequirementError, RoleMgr;

  RoleRequirementError = function RoleRequirementException(msg) {
    var self = this instanceof RoleRequirementException ? this : Object.create(RoleRequirementError.prototype);
    self.name = 'RoleRequirementError';
    self.message = msg || 'Missing Required Role';
    return self;
  };

  RoleRequirementError.prototype = Object.create(Error.prototype);
  RoleRequirementError.prototype.constructor = RoleRequirementError;

  RoleMgr = function RoleMgr() {
    var self = this instanceof RoleMgr ? this : Object.create(RoleMgr.prototype);
    return self;
  };

  RoleMgr.prototype = Object.create(Object.prototype);
  RoleMgr.prototype.constructor = RoleMgr;

  RoleMgr.prototype.checkRequirements = function checkRequirements(requirements, obj) {
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

  RoleMgr.prototype.hasRequirements = function hasRoleRequirements(role, obj) {
      var requirements;
      if (this.hasOwnProperty('roleRequirements')) {
        requirements = this.roleRequirements();
        return this.checkRequirements(requirements, obj);
      }
      return true;
    };

  RoleMgr.prototype.assignRole = function assignRole(role, obj) {
      var methods;
      if (this.hasRequirements(role, obj)) {
	methods = Object.getOwnPropertyNames(role);
	methods.map(function (method) {
	  obj[method] = role[method];
	});
      } else {
	  throw new RoleRequirementError();
      }
    };

  RoleMgr.prototype.removeRole = function removeRole(role, obj) {
      var methods = Object.getOwnPropertyNames(role);
      methods.map(function (method) {
        delete obj[method];
      });
    };

  module.exports = { RoleRequirementError: RoleRequirementError,
    RoleMgr: RoleMgr
  };
})();
