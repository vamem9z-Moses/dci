(function() {
  var assert = require('chai').assert;
  var domains = require('../../domains/accounts.js');
  var constants = require('../../domains/constants.js');
  var transfers = require('../../roles/transfersourcerole.js');

  var checkingAccount, savingsAccount, testCheckingAccount, testSavingsAccount;
  var creditor1, creditor2, testCreditor1, testCreditor2;

  checkingAccount = function checkingAccount() {
   var accountInfo = new domains.AccountInfo("124", "Miles", "Moses", 200.00, constants.AssetAccount);
   var entries = [];
   var accountDomain = new domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  savingsAccount = function savingsAccount() {
   var accountInfo = new domains.AccountInfo("125", "Miles", "Moses", 2500.00, constants.AssetAccount);
   var entries = [];
   var accountDomain = new domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  creditor1 = function creditor1 () {
   var accountInfo = new domains.AccountInfo("225", "1", "Creditor", 100.12, constants.LiabilityAccount);
   var entries = [];
   var accountDomain = new domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  creditor2 = function creditor2 () {
   var accountInfo = new domains.AccountInfo("225", "2", "Creditor", 1169.42, constants.LiabilityAccount);
   var entries = [];
   var accountDomain = new domains.AccountDomain(accountInfo, entries);
   return accountDomain;
  };

  resetAccounts = function resetAccount() {
    testSavingsAccount.entries = [];
    testCheckingAccount.entries =[];
    testCreditor1.entries = [];
    testCreditor2.entries = [];
  };

  testCheckingAccount = checkingAccount();
  testSavingsAccount = savingsAccount();
  testCreditor1 = creditor1();
  testCreditor2 = creditor2();

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
          ctx = new transfers.TransferMoneyContext(test.sourceAccount, test.destAccount,
                                              test.amount);
          ctx.execute();
          assert.strictEqual(test.expectedSource, test.sourceAccount.balance());
          assert.strictEqual(test.expectedDest, test.destAccount.balance());
        });
      });
    });
    describe("PayBillsContext", function() {
      var tests =[{msg: 'Pays bills when there are enough funds',
        sourceAccount: testSavingsAccount, creditors: [testCreditor1,testCreditor2],
        expectedSource: 1230.46, expectedCreditor1: 0, expectedCreditor2: 0},
        {msg: 'Does not pay bills when there are not enough funds',
        sourceAccount: testCheckingAccount, creditors: [testCreditor1,testCreditor2],
        expectedSource: 99.88, expectedCreditor1: 0, expectedCreditor2: 1169.42}
      ];

      tests.forEach(function(test) {
        it(test.msg, function() {
          var ctx;
          resetAccounts();
          ctx = new transfers.PayBillsContext(test.sourceAccount, test.creditors);
          ctx.execute();
          assert.strictEqual(test.expectedSource, test.sourceAccount.balance());
          assert.strictEqual(test.expectedCreditor1, testCreditor1.balance());
          assert.strictEqual(test.expectedCreditor2, testCreditor2.balance());
        });
      });
    });
  });
})();
