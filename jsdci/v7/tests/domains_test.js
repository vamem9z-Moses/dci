(function() {
  var domains = require('../domains/accounts.js');
  var constants = require('../domains/constants.js');
  var assert = require('chai').assert;

  var testAccount, creditEntries, debitEntries, mixedEntries;

  testAccount = function testAccount() {
    var accountInfo = domains.AccountInfo(22, "Moses", "Miles", 100.32,
                                          constants.AssetAccount);
    var entries = [];
    var accountDomain = domains.AccountDomain(accountInfo, entries);
    return accountDomain;
  };

  creditEntries = function creditEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 1', 50.34,
                                   constants.Credit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 2', 52.10,
                                   constants.Credit);
    return [entry1, entry2];
  };

  debitEntries = function debitEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 1', 50.34,
                                   constants.Debit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 2', 52.10,
                                   constants.Debit);
    return [entry1, entry2];
  };

  mixedEntries = function mixedEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 1', 50.34,
                                   constants.Credit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 2', 52.10,
                                   constants.Debit);
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
