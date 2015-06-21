(function() {
  var assert = require('chai').assert;
  var accounts = require('../../roles/accountrole.js');
  var domains = require('../../domains/accounts.js');
  var constants = require('../../domains/constants.js');

  var testAssetAccount = function testAssetAccount() {
    var accountInfo, entries, accountDomain;

    accountInfo = Object.create(domains.AccountInfo);
    accountInfo.init(1234, "Miles", "Moses", 100.00,constants.AssetAccount);
    entries = [];
    accountDomain = Object.create(domains.AccountDomain);
    accountDomain.init(accountInfo, entries);

    return accountDomain;
  };

  var testLiabilityAccount = function testLiabilityAccount() {
    var accountInfo, entries, accountDomain;

    accountInfo = Object.create(domains.AccountInfo);
    accountInfo.init(1234, "Miles", "Moses", 1030.00, constants.LiabilityAccount);
    entries = [];
    accountDomain = Object.create(domains.AccountDomain);
    accountDomain.init(accountInfo, entries);

    return accountDomain;
  };

  describe('Account Deposit', function() {
   var tests = [{msg: 'should increase account balance when account type is an asset account',
   account: testAssetAccount(), entryMsg:'test asset account increase',
   time:'2015-06-16 09:39:01', amount:200.12, expected: 300.12},
   {msg: 'should decrease account balance when account type is a liability account',
   account: testLiabilityAccount(), entryMsg:'test liability account decrease',
   time:'2015-06-16 09:39:01', amount:200.12, expected: 829.88},
   ];

   tests.forEach(function(test) {
      it(test.msg, function() {
        ctx = Object.create(accounts.AccountDepositContext);
        ctx.init(test.account, test.entryMsg,test.time, test.amount);
        ctx.execute();

        assert.strictEqual(test.account.balance(), test.expected);
      });
   });
  });

  describe('Account Withdraw', function() {
   var tests = [{msg: 'should decrease account balance when account type is an asset account',
   account: testAssetAccount(), entryMsg:'test asset account decrease',
   time:'2015-06-16 09:39:01', amount:100.03, expected:-0.03 },
   {msg: 'should decrease account balance when account type is a liability account',
   account: testLiabilityAccount(), entryMsg:'test liability accountincrease',
   time:'2015-06-16 09:39:01', amount:200.12, expected: 1230.12},
   ];

   tests.forEach(function(test) {
      it(test.msg, function() {
        ctx = Object.create(accounts.AccountWithDrawContext);
        ctx.init(test.account, test.entryMsg, test.time, test.amount);
        ctx.execute();

        assert.strictEqual(test.account.balance(), test.expected);
      });
   });
  });
})();
