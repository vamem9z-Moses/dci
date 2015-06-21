(function() {
  "use strict";

  var Constants = require('../domains/constants.js');
  var roles = require('./roles.js');
  var domains = require('../domains/accounts.js');
  var contexts = require('./contexts.js');

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
      entry = Object.create(domains.EntryItem);
      entry.init(accountDepositContext.account.accountInfo.accountID,
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
      entry = Object.create(domains.EntryItem);
      entry.init(accountWithDrawContext.account.accountInfo.accountID,
                                    accountWithDrawContext.entryTime,
                                    accountWithDrawContext.message,
                                    accountWithDrawContext.amount, transType);
      accountWithDrawContext.account.entries[accountWithDrawContext.account.entries.length] = entry;
    }
  };

  AccountDepositContext = Object.create(contexts.Context);

  AccountDepositContext.init = function init(accountDomain, message, entryTime, amount) {
    this.account = accountDomain;
    this.message = message;
    this.entryTime = entryTime;
    this.amount = amount;
    roles.RoleMgr.assignRole(AccountRole, this.account);
  };

  AccountDepositContext.execute = function execute() {
    this.account.deposit(this);
    roles.RoleMgr.removeRole(AccountRole, this.account);
  };

  AccountWithDrawContext = Object.create(contexts.Context);

  AccountWithDrawContext.init = function init(accountDomain, message, entryTime, amount) {
    this.account = accountDomain;
    this.message = message;
    this.entryTime = entryTime;
    this.amount = amount;
    roles.RoleMgr.assignRole(AccountRole, this.account);
  };

  AccountWithDrawContext.execute = function execute() {
    this.account.withdraw(this);
    roles.RoleMgr.removeRole(AccountRole, this.account);
  };

  module.exports = { AccountRole: AccountRole, AccountDepositContext: AccountDepositContext,
    AccountWithDrawContext: AccountWithDrawContext
  };
})();
