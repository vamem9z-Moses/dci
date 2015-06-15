(function () {
  var assert = require('chai').assert;
  var contexts = require('../../roles/contexts/contexts.js');

  var testRole = {
    testfn1: function() {},
    testfn2: function() {}
  };

  var testRoleWithRequirements = {
    testfn1: function() {},
    testfn2: function() {},
    roleRequirements: function roleRequirements () {
     return ['testMethod'];
    }
  };

  var testRoleWithRequirementsMethods = Object.getOwnPropertyNames(testRoleWithRequirements);

  var testRoleMethods = Object.getOwnPropertyNames(testRole);

  var testContext = new contexts.Context();

  var newRole = {};

  var newRoleWithRequirements = {};

  newRoleWithRequirements.testMethod = function testMethod() {};

  var emptyRole ={};

  describe('Context Functions', function() {
    describe('assignRole()', function() {
        var tests = [
          {mesg: 'assigns methods when no RoleRequirements are set',
            testObj: testRole, testingObj: newRole,
            expected: testRoleMethods},
          {mesg: 'assigns methods when RoleRequirements are met',
            testObj: testRoleWithRequirements, testingObj: newRoleWithRequirements,
            expected: testRoleWithRequirementsMethods}
        ];

        tests.forEach(function(test) {
          it(test.mesg, function() {
           var indexer, len;
           testContext.assignRole(test.testObj, test.testingObj, testContext);
           for(indexer = 0, len = test.expected.length; indexer < len; indexer += 1) {
              assert.property(test.testingObj, test.expected[indexer]);
           }

          });
        });

        it("should throw a roleRequirement error when roleRequirements aren't met",
           function() {
	     try {
	       testContext.assignRole(testRoleWithRequirements,
                                                emptyRole, testContext)
	     } catch (e) {
	      assert.instanceOf(e, contexts.RoleRequirementError);
	     }
        });

    });
    describe('RemoveRole()', function() {
      it('should remove roles from object', function() {
	newRole = {};
	testContext.assignRole(testRole, newRole, testContext);
	  assert.isTrue(newRole.hasOwnProperty('testfn1'));
	  testContext.removeRole(testRole, newRole);
	  assert.isFalse(newRole.hasOwnProperty('testfn1'));
      })

    });
  });

})();
