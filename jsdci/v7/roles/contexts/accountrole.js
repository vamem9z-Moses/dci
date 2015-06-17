(function() {
  "use strict";

  var Constants = require('../../domains/constants.js');
  var contexts = require('../../roles/contexts/contexts.js');
  var domains = require('../../domains/accounts.js');

  var AccountRole, AccountDepositContext, AccountWithDrawContext;

  AccountRole = {
    roleRequirements: function roleRequirements() {
      return ['accountInfo', 'entries'];
    },
    deposit:  function deposit(accountDepositContext) {
      var transType, entry;
      switch (accountDepositContext.account.accountInfo.accountType) {
        case Constants.AssetAccount:
          transType = Constants.Credit;
          break;
        case Constants.LiabilityAccount:
          transType = Constants.Debit;
          break;
      }
      entry = new domains.EntryItem(accountDepositContext.account.accountInfo.accountID,
                                      accountDepositContext.entryTime,
                                      accountDepositContext.message,
                                      accountDepositContext.amount, transType);
      accountDepositContext.account.entries[accountDepositContext.account.entries.length] = entry;
    },
    withdraw: function withdraw(accountWithDrawContext) {
      var transType, entry;
      switch (accountWithDrawContext.account.accountInfo.accountType) {
        case Constants.AssetAccount:
          transType = Constants.Debit;
          break;
        case Constants.LiabilityAccount:
          transType = Constants.Credit;
          break;
      }
      entry = new domains.EntryItem(accountWithDrawContext.account.accountInfo.accountID,
                                    accountWithDrawContext.entryTime,
                                    accountWithDrawContext.message,
                                    accountWithDrawContext.amount, transType);
    accountWithDrawContext.account.entries[accountWithDrawContext.account.entries.length] = entry;
    }
  };

  AccountDepositContext = function AccountDepositContext(accountDomain, message, entryTime, amount) {
    var self = this instanceof AccountDepositContext ? this : Object.create(AccountDepositContext.prototype);
    self.account = accountDomain;
    self.message = message;
    self.entryTime = entryTime;
    self.amount = amount;
    self.assignRole(AccountRole, self.account, this);
    return self;
  };

  AccountDepositContext.prototype = Object.create(contexts.Context.prototype);

  AccountDepositContext.prototype.execute = function execute() {
    this.account.deposit(this);
    this.removeRole(AccountRole, this.account);
  };

  AccountWithDrawContext = function AccountWithDrawContext(accountDomain, message, entryTime, amount) {
    var self = this instanceof AccountWithDrawContext ? this : Object.create(AccountWithDrawContext.prototype);
    self.account = accountDomain;
    self.message = message;
    self.entryTime = entryTime;
    self.amount = amount;
    self.assignRole(AccountRole, self.account, this);
    return self;
  };

  AccountWithDrawContext.prototype = Object.create(contexts.Context.prototype);

  AccountWithDrawContext.prototype.execute = function execute() {
    this.account.withdraw(this);
    this.removeRole(AccountRole, this.account);
  };

  module.exports = { AccountRole: AccountRole, AccountDepositContext: AccountDepositContext,
    AccountWithDrawContext: AccountWithDrawContext
  };
})();
