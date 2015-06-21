(function() {
  var domains = require('../domains/accounts.js');
  var constants = require('../domains/constants.js');
  var assert = require('chai').assert;

  var testAccount, creditEntries, debitEntries, mixedEntries;

  testAccount = function testAccount() {
    var accountInfo, entries, accountDomain;

    accountInfo = Object.create(domains.AccountInfo);
    accountInfo.init(22, "Moses", "Miles", 100.32, constants.AssetAccount);
    entries = [];
    accountDomain = Object.create(domains.AccountDomain);
    accountDomain.init(accountInfo, entries);

    return accountDomain;
  };

  creditEntries = function creditEntries() {
    var entry1, entry2;

    entry1 = Object.create(domains.EntryItem);
    entry1.init(22, '2015-02-28', 'Credit Entry 1', 50.34, constants.Credit);
    entry2 = Object.create(domains.EntryItem);
    entry2.init(22, '2015-02-28', 'Credit Entry 2', 52.10, constants.Credit);

    return [entry1, entry2];
  };

  debitEntries = function debitEntries() {
    var entry1, entry2;

    entry1 = Object.create(domains.EntryItem);
    entry1.init(22, '2015-02-28', 'Debit Entry 1', 50.34, constants.Debit);
    entry2 = Object.create(domains.EntryItem);
    entry2.init(22, '2015-02-28', 'Debit Entry 2', 52.10, constants.Debit);

    return [entry1, entry2];
  };

  mixedEntries = function mixedEntries() {
    var entry1, entry2;

    entry1 = Object.create(domains.EntryItem);
    entry1.init(22, '2015-02-28', 'Credit Entry 1', 50.34, constants.Credit);
    entry2 = Object.create(domains.EntryItem);
    entry2.init(22, '2015-02-28', 'Debit Entry 2', 52.10,constants.Debit);

    return [entry1, entry2];
  };

  describe('Account Domain balance()', function() {
    var tests = [
      {mes: 'it returns the correct account balance with no entry items',
        entries: [], expected: 100.32},
      {mes: 'it returns the correct account balance with credit entries',
        entries: creditEntries(), expected: 202.76},
      {mes: 'it returns the correct account balance with debit entries',
        entries: debitEntries(), expected: -2.12},
      {mes: 'it returns the correct account balance with mixed entries',
        entries: mixedEntries(), expected: 98.56},
    ];

    tests.forEach(function(test) {
      it(test.mes, function() {
        var account = testAccount();
        account.entries = test.entries;
        var res = account.balance();
        assert.equal(res, test.expected);
      });
    });
  });
})();
