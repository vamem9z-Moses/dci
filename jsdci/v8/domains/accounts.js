(function () {
  "use strict";

  var Constants = require('./constants.js');

  var AccountInfo, EntryItem, AccountDomain, createAccount;

  AccountInfo = {
    init: function init(accountID, lastName, firstName, startingBalance, accountType) {
      this.accountID = accountID;
      this.lastName = lastName;
      this.firstName = firstName;
      this.startingBalance = startingBalance;
      this.accountType = accountType;
    }
  };

  EntryItem = {
    init: function init(accountID, date, message, amount, transactionType) {
      this.accountID = accountID;
      this.date = date;
      this.message = message;
      this.amount = amount;
      this.transactionType = transactionType;
    }
  };

  AccountDomain = {
    init: function init(accountInfo, entryItems) {
      this.accountInfo = accountInfo;
      this.entries = entryItems;
    },
    balance: function balance() {
      var entry, currentBalance, indexer, len;
      currentBalance = this.accountInfo.startingBalance * 100;
      for (indexer = 0, len = this.entries.length; indexer < len; indexer += 1) {
        entry = this.entries[indexer];
        switch (entry.transactionType) {
          case Constants.Credit:
            currentBalance += entry.amount * 100;
            break;
          case Constants.Debit:
            currentBalance -= entry.amount * 100;
            break;
        }
      }
      return currentBalance/100;
    }
  };

  createAccount = function createAccount(id, lastName, firstName, startingBalance, accountType) {
    var accountInfo, entries, accountDomain;

    accountInfo = Object.create(AccountInfo);
    accountInfo.init(id, lastName, firstName, startingBalance, accountType);
    entries =[];
    accountDomain = Object.create(AccountDomain);
    accountDomain.init(accountInfo, entries);

    return accountDomain;
  };

  module.exports = {AccountInfo: AccountInfo, EntryItem: EntryItem,
    AccountDomain: AccountDomain, createAccount: createAccount
  };
})();
