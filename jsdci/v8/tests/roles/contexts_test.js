(function() {
  "use strict";

  var assert = require('chai').assert;
  var contexts = require('../../roles/contexts.js');

  var TestContext, testRule, ruleAction;

  ruleAction = 0;

  testRule = {
    action: function action(ctx) {
      ruleAction = 1;
    }
  };

  TestContext = Object.create(contexts.Context);
  TestContext.businessRules = [testRule];

  describe('Contexts', function() {
    describe('applyRules', function() {
      it('Business rules are applied when called', function() {
        TestContext.applyRules();
        assert.strictEqual(1, ruleAction);
      });
    });
  });
})();
