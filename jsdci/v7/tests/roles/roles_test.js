(function () {
  var assert = require('chai').assert;
  var roles = require('../../roles/roles.js');


  var TestContext = function TestContext(role, obj) {
    var self = this instanceof TestContext ? this : Object.create(TestContext.prototype);
    self.role = role;
    self.obj = obj;
    self.roleMgr = roles.RoleMgr();
    self.roleMgr.assignRole(self.role, self.obj);
    return self;
  };

  TestContext.prototype = Object.create(Object.prototype);
  TestContext.prototype.constructor = TestContext;

  var TestRole = function TestRole() {
    var self = this instanceof TestRole ? this : Object.create(Object.prototype);
    self.testfn1 = function() {};
    self.testfn2 = function() {};
    return self;
  };

  var TestRoleWithRequirements = function TestRoleWithRequirements() {
    var self = this instanceof TestRoleWithRequirements ? this : Object.create(Object.prototype);
    self.testfn1 = function() {};
    self.testfn2 = function() {};
    self.roleRequirements = function roleRequirements () {
     return ['testMethod'];
    };
    return self;
  };

  var TestRoleWithRequirementsMethods = Object.getOwnPropertyNames(TestRoleWithRequirements());

  var TestRoleMethods = Object.getOwnPropertyNames(TestRole());

  var newRole = function newRole() {
    var self = this instanceof newRole ? this : Object.create(Object.prototype);
    return self;
  };

  var newRoleWithRequirements = {};

  newRoleWithRequirements.testMethod = function testMethod() {};

  var emptyRole ={};

  describe('Role Functions', function() {
    describe('assignRole()', function() {
        var tests = [
          {mesg: 'assigns methods when no RoleRequirements are set',
            testObj: TestRole(), testingObj: newRole(),
            expected: TestRoleMethods },
          {mesg: 'assigns methods when RoleRequirements are met',
            testObj: TestRoleWithRequirements(), testingObj: newRoleWithRequirements,
            expected: TestRoleWithRequirementsMethods}
        ];

        tests.forEach(function(test) {
          it(test.mesg, function() {
           var indexer, len;
           var testContext = new TestContext(test.testObj, test.testingObj);
           for(indexer = 0, len = test.expected.length; indexer < len; indexer += 1) {
             assert.property(test.testingObj, test.expected[indexer]);
           }

          });
        });

        it("should throw a roleRequirement error when roleRequirements aren't met",
           function() {
	     try {
	       testContext = new TestContext(TestRoleWithRequirements(),emptyRole);
	     } catch (e) {
	      assert.instanceOf(e, roles.RoleRequirementError);
	     }
        });
    });

    describe('RemoveRole()', function() {
      it('should remove roles from object', function() {
        var role = TestRole();
        var obj = newRole();
	var testContext = TestContext(role,obj);
        var roleMgr = roles.RoleMgr();
        assert.isTrue(obj.hasOwnProperty('testfn1'));
        roleMgr.removeRole(role,obj);
        assert.isFalse(obj.hasOwnProperty('testfn1'));
      });

    });
  });
})();
