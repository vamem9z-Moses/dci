(function () {
  "use strict";

  var RoleRequirementError, Context;

  RoleRequirementError = function RoleRequirementException(msg) {
    var self = this instanceof RoleRequirementException ? this : Object.create(RoleRequirementError.prototype);
    self.name = 'RoleRequirementError';
    self.message = msg || 'Missing Required Role';
    return self;
  };

  RoleRequirementError.prototype = Object.create(Error.prototype);
  RoleRequirementError.prototype.constructor = RoleRequirementError;

  Context = function Context() {
    var self = this instanceof Context ? this : Object.create(Context.prototype);
    return self;
  };

  Context.prototype = Object.create(Object.prototype);
  Context.prototype.constructor = Context;

  Context.prototype.checkRequirements = function checkRequirements(requirements, obj) {
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

  Context.prototype.hasRequirements = function hasRoleRequirements(role, obj, ctx) {
      var requirements;
      if (role.hasOwnProperty('roleRequirements')) {
        requirements = role.roleRequirements();
        return ctx.checkRequirements(requirements, obj);
      }
      return true;
    };

  Context.prototype.assignRole = function assignRole(role, obj, ctx) {
      var methods;
      if (ctx.hasRequirements(role, obj,ctx)) {
	methods = Object.getOwnPropertyNames(role);
	methods.map(function (method) {
	  obj[method] = role[method];
	});
      } else {
	  throw new RoleRequirementError();
      }
    };

  Context.prototype.removeRole = function removeRole(role, obj) {
      var methods = Object.getOwnPropertyNames(role);
      methods.map(function (method) {
        delete obj[method];
      });
    };

  module.exports = { RoleRequirementError: RoleRequirementError,
    Context: Context
  };
})();
