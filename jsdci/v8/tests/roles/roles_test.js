(function () {
  var assert = require('chai').assert;
  var roles = require('../../roles/roles.js');

  var TestRole, testRole, testRoleMethods, TestRoleWithRequirements, testRoleWithRequirements,
      testRoleWithRequirementsMethods, newRoleWithRequirements;

  TestRole = {
    init: function init() {
      this.testfn1 = function() {};
      this.testfn2 = function() {};
    }
  };

  testRole = Object.create(TestRole);
  testRole.init();

  testRoleMethods = Object.getOwnPropertyNames(testRole);

  TestRoleWithRequirements = {
    init: function init() {
      this.testfn1 = function() {};
      this.testfn2 = function() {};
    },
    roleRequirements: function roleRequirements () {
     return ['testMethod'];
    }
  };

  testRoleWithRequirements = Object.create(TestRoleWithRequirements);
  testRoleWithRequirements.init();

  testRoleWithRequirementsMethods = Object.getOwnPropertyNames(testRoleWithRequirements);


  newRoleWithRequirements = {
    testMethod:function testMethod() {
    }
  };

  describe('Role Functions', function() {
    describe('assignRole()', function() {
        var tests = [
          {mesg: 'assigns methods when no RoleRequirements are set',
            testObj: testRole, testingObj: {}, expected: testRoleMethods },
          {mesg: 'assigns methods when RoleRequirements are met',
            testObj: testRoleWithRequirements, testingObj: newRoleWithRequirements,
            expected: testRoleWithRequirementsMethods}
        ];

        tests.forEach(function(test) {
          it(test.mesg, function() {
           var indexer, len;
            roles.RoleMgr.assignRole(test.testObj, test.testingObj);
            assert.isTrue(test.testingObj.hasOwnProperty('testfn1'));
            for(indexer = 0, len = test.expected.length; indexer < len; indexer += 1) {
             assert.property(test.testingObj, test.expected[indexer]);
           }

          });
        });

        it("should throw a roleRequirement error when roleRequirements aren't met",
           function() {
	     try {
	       roles.RoleMgr.assignRole(testRoleWithRequirements,{});
	     } catch (e) {
               console.log(e);
	      assert.isTrue(e.isProtoypeOf(roles.RoleRequirementError));
	     }
        });
    });

    describe('RemoveRole()', function() {
      it('should remove roles from object', function() {
        var obj = {};

        roles.RoleMgr.assignRole(testRole, obj);
        assert.isTrue(obj.hasOwnProperty('testfn1'));

        roles.RoleMgr.removeRole(testRole, obj);
        assert.isFalse(obj.hasOwnProperty('testfn1'));
      });
    });
  });
})();
