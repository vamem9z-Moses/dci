(function () {
  "use strict";

  var Constants = require('./constants.js');

  var AccountInfo, EntryItem, AccountDomain;


  AccountInfo = function AccountInfo(accountID, lastName, firstName, startingBalance, accountType) {
    var self = this instanceof AccountInfo ? this : Object.create(AccountInfo.prototype);
    self.accountID = accountID;
    self.lastName = lastName;
    self.firstName = firstName;
    self.startingBalance = startingBalance;
    self.accountType = accountType;
    return self;
  };

  EntryItem = function EntryItem(accountID, date, message, amount, transactionType) {
    var self = this instanceof EntryItem ? this : Object.create(EntryItem.prototype);
    self.accountID = accountID;
    self.date = date;
    self.message = message;
    self.amount = amount;
    self.transactionType = transactionType;
    return self;
  };

  AccountDomain = function AccountDomain(accountInfo, entryItems) {
    var self = this instanceof AccountDomain ? this : Object.create(AccountDomain.prototype);
    self.accountInfo = accountInfo;
    self.entries = entryItems;
    return self;
  };

  AccountDomain.prototype = {
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

  module.exports = {AccountInfo: AccountInfo, EntryItem: EntryItem,
    AccountDomain: AccountDomain,
  };
})();
