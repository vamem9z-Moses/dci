(function() {
  "use strict";

  AccountRole = {
    roleRequirements: function roleRequirements() {
      return [this.accountInfo, this.entries];
    },
    deposit:  function deposit(accountDepositContext) {
      var transType, entry;
      switch (this.accountInfo.accountType) {
        case Constants.AssetAccount:
          transType = Constants.Credit;
          break;
        case Constants.LiabilityAccount:
          transType = Constants.Debit;
          break;
      }
      entry = Object.create(EntryItem(this.accountInfo.accountID, accountDepositContext.entryTime,
                                accountDepositContext.message, accountDepositContext.amount, transType));
      this.entries[this.entries.length] = entry;
    },
    withdraw: function withdraw(AccountWithDrawContext) {
      var transType, entry;
      switch (this.accountInfo.accountType) {
        case Constants.AssetAccount:
          transType = Constants.Debit;
          break;
        case Constants.LiabilityAccount:
          transType = Constants.Credit;
          break;
      }
      entry = EntryItem(this.accountInfo.accountID, AccountWithDrawContext.entryTime,
                                AccountWithDrawContext.message, AccountWithDrawContext.amount, transType);
    this.entries[this.entries.length] = entry;
    }
  };

  AccountDepositContext = function AccountDepositContext(accountDomain, message, entryTime, amount) {
    var self = this instanceof AccountDepositContext ? this : Object.create(AccountDepositContext.prototype);
    self.account = accountDomain;
    self.message = message;
    self.entryTime = entryTime;
    self.amount = amount;
    self.assignRole(AccountRole, self.account);
    return self;
  };

  AccountDepositContext.prototype = Object.create(Context);

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
    self.assignRole(AccountRole, self.account);
    return self;
  };

  AccountWithDrawContext.prototype = Object.create(Context);

  AccountWithDrawContext.prototype.execute = function execute() {
    this.account.withdraw(this);
    this.removeRole(AccountRole, this.account);
  };
})();
