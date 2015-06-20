(function() {
  var assert = require('chai').assert;
  var domains = require('../../domains/accounts.js');
  var constants = require('../../domains/constants.js');
  var transfers = require('../../roles/transfersourcerole.js');

  var checkingAccount, savingsAccount, testCheckingAccount, testSavingsAccount;

  checkingAccount = function checkingAccount() {
   var accountInfo = domains.AccountInfo("124", "Miles", "Moses", 200.00, constants.AssetAccount);
   var entries = [];
   var accountDomain = domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  savingsAccount = function savingsAccount() {
   var accountInfo = domains.AccountInfo("125", "Miles", "Moses", 2500.00, constants.AssetAccount);
   var entries = [];
   var accountDomain = domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  resetAccounts = function resetAccount() {
    testSavingsAccount.entries = [];
    testCheckingAccount.entries =[];
  };

  testCheckingAccount = checkingAccount();
  testSavingsAccount = savingsAccount();

  describe("Transfer Money Source", function() {
    describe("Transfer Money Context", function () {
      var tests = [{msg: 'Transfer is successful when there are enough funds',
        sourceAccount: testSavingsAccount, destAccount: testCheckingAccount, amount: 312.21,
        expectedSource: 2187.79, expectedDest: 512.21},{msg: 'Transfer is unsuccessful when there are not enough funds',
        sourceAccount: testSavingsAccount, destAccount: testCheckingAccount, amount: 3000.00,
        expectedSource: 2500.00, expectedDest: 200.00}
      ];

      tests.forEach(function(test) {
        it(test.msg, function() {
          var ctx;
          resetAccounts();
          ctx = transfers.TransferMoneyContext(test.sourceAccount, test.destAccount,
                                              test.amount);
          ctx.execute();
          assert.strictEqual(test.expectedSource, test.sourceAccount.balance());
          assert.strictEqual(test.expectedDest, test.destAccount.balance());
        });
      });
    });
  });

})();
