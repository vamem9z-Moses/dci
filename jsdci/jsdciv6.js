"use strict";

var Constants = {
  LiabilityAccount: "liabilityaccount",
  AccessAccount: "assetaccount",
  Credit: "credit",
  Debit: "debit",
};

Object.freeze(Constants);

var UserRole = {
  hasRoleRequirements: function hasRoleRequirements() {
    if (this.roleRequirements) {
      return this.checkRequirements();
    }
    return true;
  },
  checkRequirements: function checkRequirements() {
    var hasRequirement, requirements;
    requirements = this.roleRequirements();
    for (var i=0, len = requirements.length; i < len; i++) {
      if (requirements[i]) {
	hasRequirement = true;
      }
      else {
	hasRequirement = false;
	break;
      }
    }
    return hasRequirement;
  },
  assignRole: function assignRole(obj) {
    var role, roleMethods, rolePrototypeMethods;

    role = this;
    roleMethods = Object.getOwnPropertyNames(role);
    rolePrototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(role));

    roleMethods.map(function(method) {
      obj[method] = role[method];
    });


    rolePrototypeMethods.map(function(method) {
      obj[method] = role[method];
    });
    if (!obj.hasRoleRequirements()){
      throw new RoleRequirementException("RoleRequirementException", "Missing required property for role: " + obj.constructor.name);
    }
  },
  removeRole: function removeRole(obj) {
    var methods = Object.getOwnPropertyNames(this);
    methods.map(function(method) {
      delete obj[method];
    });
  }
};

var RoleRequirementException = function RoleRequirementException(name, msg) {
  var self = this instanceof RoleRequirementException ? this : Object.create(RoleRequirementException.prototype);
  self.name = name;
  self.message = msg;
  return self;
};

var Context = {
};

var AccountInfo = function AccountInfo(accountID, lastName, firstName, startingBalance, accountType) {
  var self = this instanceof AccountInfo ? this : Object.create(AccountInfo.prototype);
  self.accountID = accountID;
  self.lastName = lastName;
  self.firstName = firstName;
  self.startingBalance = startingBalance;
  self.accountType = accountType;
  return self;
};

var EntryItem = function EntryItem (accountID, date, message, amount, transactionType) {
  var self = this instanceof EntryItem ? this : Object.create(EntryItem.prototype);
  self.accountID = accountID;
  self.date = date;
  self.message = message;
  self.amount = amount;
  self.transactionType = transactionType;
  return self;
};

var AccountDomain = function AccountDomain(accountInfo, entryItems) {
  var self = this instanceof AccountDomain ? this : Object.create(AccountDomain.prototype);
  self.accountInfo = accountInfo;
  self.entries = entryItems;
  return self;
};

AccountDomain.prototype = {
  balance: function balance() {
    var entry, currentBalance;
    currentBalance = this.accountInfo.startingBalance * 100;
    for (var i=0, len = this.entries.length; i < len; i++) {
      entry = this.entries[i];
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

var AccountRole = (function AccountRole() {
  var self = Object.create(UserRole);
  
  self.roleRequirements = function roleRequirements() {
    return [this.accountInfo, this.entries]; 
    };
  self.deposit = function deposit(accountDepositContext) {
    var transType, entry;
    switch (this.accountInfo.accountType) {
      case Constants.AccessAccount:
        transType = Constants.Credit;
        break;
      case Constants.LiabilityAccount:
        transType = Constants.Debit;
        break;
    }
    entry = EntryItem(this.accountInfo.accountID, accountDepositContext.entryTime, 
			      accountDepositContext.message, accountDepositContext.amount, transType);
    this.entries[this.entries.length] = entry;
  };
  self.withdraw = function withdraw(AccountWithDrawContext) {
    var transType, entry;
    switch (this.accountInfo.accountType) {
      case Constants.AccessAccount:
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
  return self;
}());

var AccountDepositContext = function AccountDepositContext(accountDomain, message, entryTime, amount) {
  var self = this instanceof AccountDepositContext ? this : Object.create(AccountDepositContext.prototype);
  self.account = accountDomain;
  self.message = message;
  self.entryTime = entryTime;
  self.amount = amount;
  AccountRole.assignRole(self.account);
  return self;
};

AccountDepositContext.prototype = Object.create(Context);

AccountDepositContext.prototype.execute = function execute() {
  this.account.deposit(this);
  //this.removeRole(AccountRole, this.account);
};

var AccountWithDrawContext = function AccountWithDrawContext(accountDomain, message, entryTime, amount) {
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

var TransferMoneySource = {
  roleRequirements: function roleRequirements() { 
    return [this.balance];
  },
  hasSufficentFunds: function hasSufficentFunds(transferMoneyContext) {
    if (this.balance() < transferMoneyContext.amount) {
      return false;
    }
    return true;
  },
  transferTo: function transferTo(transferMoneyContext) {
    var withdrawMsg, accWithCtx, accDepMsg, accDepCtx;
    if (!this.hasSufficentFunds(transferMoneyContext)) {
      console.log("Insufficient Funds");
      return;
    }
    withdrawMsg = "Transfer To " + transferMoneyContext.dest.accountInfo.accountID.toString();
    accWithCtx = Object.create(AccountWithDrawContext(this, withdrawMsg, 
						      "2014-08-02 18:14", 
						      transferMoneyContext.amount));
    accWithCtx.execute();

    accDepMsg = "Transfer From " + this.accountInfo.accountID.toString();
    accDepCtx = Object.create(AccountDepositContext(transferMoneyContext.dest, 
						    accDepMsg, "2014-08-02 18:14", 
						    transferMoneyContext.amount));
    accDepCtx.execute();
  },
  payBills: function payBills(payBillsContext) {
    var creditor, tmc;
    for (var i=0, len = payBillsContext.creditors.length; i < len; i++) {
      creditor = payBillsContext.creditors[i];
      tmc = Object.create(TransferMoneyContext(this, creditor, creditor.balance()));
      tmc.execute();
    }
  }
};

//TransferMoneySource.prototype = Object.create(Role);
  
var TransferMoneyContext = function TransferMoneyContext(sourceAccount, destAccount, amount) {
  var self = this instanceof TransferMoneyContext ? this : Object.create(TransferMoneyContext.prototype);
  self.source = sourceAccount;
  self.dest = destAccount;
  self.amount = amount;
  self.assignRole(TransferMoneySource, self.source);
  return self;
};
  
TransferMoneyContext.prototype = Object.create(Context);

TransferMoneyContext.prototype.execute = function execute() {
  this.source.transferTo(this);
  this.removeRole(TransferMoneySource, this.source);
};

var PayBillsContext = function PayBillsContext(sourceAccount, creditors) {
  var self = this instanceof PayBillsContext ? this : Object.create(PayBillsContext.prototype);
  self.source = sourceAccount;
  self.creditors = creditors;
  self.assignRole(TransferMoneySource, self.source);
  return self;
};
  
PayBillsContext.prototype = Object.create(Context);

PayBillsContext.prototype.execute  = function execute() {
    this.source.payBills(this);
    this.removeRole(TransferMoneySource, this.source);
};

function MosesTestAccountDomain() {
  var accountInfo = AccountInfo(20403, "Miles", "Moses", 4000.30, Constants.AssetAccount);
  var entries = [];
  var accountDomain = AccountDomain(accountInfo, entries);
  return accountDomain;
}

function KathyTestAccountDomain() {
  var accountInfo = new AccountInfo(98345, "Miles", "Kathy", 2809.01, Constants.AccessAccount);
  var entries = [];
  var accountDomain = new AccountDomain(accountInfo, entries);
  return accountDomain;
}

function CreditorTestAccountDomains()  {
  var vendor1AccountInfo = new AccountInfo(3452, "Account 1", "Vendor", 30.52, Constants.LiabilityAccount);
  var vendor1Entries = [];
  var vendor1AccountDomain = new AccountDomain(vendor1AccountInfo, vendor1Entries);
  var vendor2AccountInfo = new AccountInfo(309201, "Account 2", "Vendor", 498.22, Constants.LiabilityAccount);
  var vendor2Entries = [];
  var vendor2AccountDomain = new AccountDomain(vendor2AccountInfo, vendor2Entries);
  var creditors = [vendor1AccountDomain, vendor2AccountDomain];
  return creditors;
}

function depositSomeCash() {
  console.log("Deposit Some Cash");
  var account = new MosesTestAccountDomain();
  console.log("Moses Account Starting Balance = " + account.balance());
  var accDepCtx = new AccountDepositContext(account, "Initial Deposit", "2014-08-02 3:59", 500.00);
  accDepCtx.execute();
  console.log("Moses Account Ending Balance = " + account.balance() + "\n");
}

function withdrawSomeCash() {
  console.log("Withdraw Some Cash");
  var account = new MosesTestAccountDomain();
  console.log("Moses Account Starting Balance = " + account.balance());
  var accWithCtx = new AccountWithDrawContext(account, "First Withdraw", "2014-08-02 5:56", 700.00);
  accWithCtx.execute();
  console.log("Moses Account Ending Balance = " + account.balance() + "\n");
}

function transferSomeCash() {
  console.log("Transfer Some Cash");
  var sourceAccount = new MosesTestAccountDomain();
  var destAccount = new KathyTestAccountDomain();
  console.log("Moses Account Starting Balance = " + sourceAccount.balance());
  console.log("Kathy Account Starting Balance = " + destAccount.balance());
  var tmctx = new TransferMoneyContext(sourceAccount, destAccount, 400.00);
  tmctx.execute();
  console.log("Moses Account Ending Balance = " + sourceAccount.balance());
  console.log("Kathy Account Ending Balance = " + destAccount.balance() + "\n");
}

function transferSomeCashInsufficentFunds() {
  console.log("Transfer Some Cash Insufficient Funds");
  var sourceAccount = new MosesTestAccountDomain();
  var destAccount = new KathyTestAccountDomain();
  console.log("Moses Account Starting Balance = " + sourceAccount.balance());
  console.log("Kathy Account Starting Balance = " + destAccount.balance());
  var tmctx = new TransferMoneyContext(sourceAccount, destAccount, 8000.00);
  tmctx.execute();
  console.log("Moses Account Ending Balance = " + sourceAccount.balance());
  console.log("Kathy Account Ending Balance = " + destAccount.balance() + "\n");
}

function printCreditorBalances(creditors, balanceType) {
  for (var i=0, len = creditors.length; i < len; i++) {
    var creditor = creditors[i];
    console.log(creditor.accountInfo.firstName + " " + creditor.accountInfo.lastName + " " + balanceType + " Balance = " + creditor.balance());
  }
}

function paySomeBills() {
  console.log("Pay Some Bills");
  var sourceAccount = new MosesTestAccountDomain();
  var creditors = new CreditorTestAccountDomains();
  console.log("Moses Account Starting Balance = " + sourceAccount.balance());
  printCreditorBalances(creditors, "Starting");
  var pbctx = new PayBillsContext(sourceAccount, creditors);
  pbctx.execute();
  console.log("Moses Account Ending Balance = " + sourceAccount.balance());
  printCreditorBalances(creditors, "Ending");
}

console.log(AccountRole);
console.log(Object.getPrototypeOf(AccountRole));

depositSomeCash();
/*
depositSomeCash();
withdrawSomeCash();
transferSomeCash();
transferSomeCashInsufficentFunds();
paySomeBills();
*/
