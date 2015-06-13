(function() {
  var domains = require('../domains.js')
    , assert = require('chai').assert
    , testAccount;

  testAccount = function testAccount() {
    var accountInfo = domains.AccountInfo(22, "Moses", "Miles", 100.32,
                                          domains.Constants.AssetAccount)
    , entries = []
    , accountDomain = domains.AccountDomain(accountInfo, entries);
    return accountDomain;
  }

  creditEntries = function creditEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 1', 50.34,
                                   domains.Constants.Credit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 2', 52.10,
                                   domains.Constants.Credit);
    return [entry1, entry2];
  }

  debitEntries = function debitEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 1', 50.34,
                                   domains.Constants.Debit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 2', 52.10,
                                   domains.Constants.Debit);
    return [entry1, entry2];
  }

  mixedEntries = function mixedEntries() {
    var entry1 = domains.EntryItem(22, '2015-02-28', 'Credit Entry 1', 50.34,
                                   domains.Constants.Credit);
    var entry2 = domains.EntryItem(22, '2015-02-28', 'Debit Entry 2', 52.10,
                                   domains.Constants.Debit);
    return [entry1, entry2];
  }

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
        account = testAccount();
        account.entries = test.entries;
        var res = account.balance();
        assert.equal(res, test.expected);
      });
    });
  });
})();
