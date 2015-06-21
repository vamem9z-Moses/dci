(function() {
  var assert = require('chai').assert;
  var domains = require('../../domains/accounts.js');
  var constants = require('../../domains/constants.js');
  var transfers = require('../../roles/transfersourcerole.js');

  var checkingAccount, savingsAccount, creditor1, creditor2;

  checkingAccount = domains.createAccount("124", "Miles", "Moses", 200.00, constants.AssetAccount);
  savingsAccount = domains.createAccount("125", "Miles", "Moses", 2500.00, constants.AssetAccount);
  creditor1 = domains.createAccount("225", "1", "Creditor", 100.12, constants.LiabilityAccount);
  creditor2 = domains.createAccount("225", "2", "Creditor", 1169.42, constants.LiabilityAccount);

  resetAccounts = function resetAccount() {
    savingsAccount.entries = [];
    checkingAccount.entries =[];
    creditor1.entries = [];
    creditor2.entries = [];
  };

  describe("Transfer Money Source", function() {
    describe("Transfer Money Context", function () {
      var tests = [{msg: 'Transfer is successful when there are enough funds',
        sourceAccount: savingsAccount, destAccount: checkingAccount, amount: 312.21,
        expectedSource: 2187.79, expectedDest: 512.21},{msg: 'Transfer is unsuccessful when there are not enough funds',
        sourceAccount: savingsAccount, destAccount: checkingAccount, amount: 3000.00,
        expectedSource: 2500.00, expectedDest: 200.00}
      ];

      tests.forEach(function(test) {
        it(test.msg, function() {
          var ctx;

          resetAccounts();
          ctx = Object.create(transfers.TransferMoneyContext);
          ctx.init(test.sourceAccount, test.destAccount, test.amount);
          ctx.execute();

          assert.strictEqual(test.expectedSource, test.sourceAccount.balance());
          assert.strictEqual(test.expectedDest, test.destAccount.balance());
        });
      });
    });
    describe("PayBillsContext", function() {
      var tests =[{msg: 'Pays bills when there are enough funds',
        sourceAccount: savingsAccount, creditors: [creditor1, creditor2],
        expectedSource: 1230.46, expectedCreditor1: 0, expectedCreditor2: 0},
        {msg: 'Does not pay bills when there are not enough funds',
        sourceAccount: checkingAccount, creditors: [creditor1, creditor2],
        expectedSource: 99.88, expectedCreditor1: 0, expectedCreditor2: 1169.42}
      ];

      tests.forEach(function(test) {
        it(test.msg, function() {
          var ctx;

          resetAccounts();
          ctx = Object.create(transfers.PayBillsContext);
          ctx.init(test.sourceAccount, test.creditors);
          ctx.execute();

          assert.strictEqual(test.expectedSource, test.sourceAccount.balance());
          assert.strictEqual(test.expectedCreditor1, creditor1.balance());
          assert.strictEqual(test.expectedCreditor2, creditor2.balance());
        });
      });
    });
  });
})();
