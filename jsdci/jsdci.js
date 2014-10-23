var LIABILITYACCOUNT = "liabilityaccount";
var ASSETACCOUNT = "assetaccount";
var CREDIT = "credit";
var DEBIT = "debit";

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
  self.balance = function() {
    currentBalance = self.accountInfo.startingBalance;
    for (var i=0, len = self.entries.length; i < len; i++) {
      var entry = self.entries[i];
      switch (entry.transactionType) {
	case CREDIT:
          currentBalance += entry.amount;
	  break;
        case DEBIT:
          currentBalance -= entry.amount;
          break;
      }

    }
    return currentBalance;
  };
  return self;
};

var AccountRole = function AccountRole() {
  var self = this instanceof AccountRole ? this : Object.create(AccountRole.prototype);
  self.deposit = function(accountDepositContext) {
    var transType;
    switch (this.accountInfo.accountType) {
      case ASSETACCOUNT:
        transType = CREDIT;
        break;
      case LIABILITYACCOUNT:
        transType = DEBIT;
        break;
    }
    var entry = new EntryItem(this.accountInfo.accountID, accountDepositContext.entryTime, 
			      accountDepositContext.message, accountDepositContext.amount, transType);
    this.entries[this.entries.length] = entry;
  };
  self.withdraw = function(AccountWithDrawContext) {
    var transType;
    switch (this.accountInfo.accountType) {
      case ASSETACCOUNT:
	transType = DEBIT;
	break;
      case LIABILITYACCOUNT:
	tranType = CREDIT;
	break;
    }
    var entry = new EntryItem(this.accountInfo.accountID, AccountWithDrawContext.entryTime, 
			      AccountWithDrawContext.message, AccountWithDrawContext.amount, transType);
  this.entries[this.entries.length] = entry;
  };
  return self;
};

var AccountDepositContext = function AccountDepositContext(accountDomain, message, entryTime, amount) {
  var self = this instanceof AccountDepositContext ? this : Object.create(AccountDepositContext.prototype);
  self.account = accountDomain;
  self.message = message;
  self.entryTime = entryTime;
  self.amount = amount;
  self.execute = function () {
    AccountRole().deposit.call(self.account, self);
  };
  return self;
};

var AccountWithDrawContext = function AccountWithDrawContext(accountDomain, message, entryTime, amount) {
  var self = this instanceof AccountWithDrawContext ? this : Object.create(AccountWithDrawContext.prototype);
    self.account = accountDomain;
    self.message = message;
    self.entryTime = entryTime;
    self.amount = amount;
    self.execute = function() {
      AccountRole().withdraw.call(self.account, self);
    };
  return self;
};

var TransferMoneySource = function TransferMoneySource() {
  var self = this instanceof TransferMoneySource ? this : Object.create(TransferMoneySource.prototype);
  self.hasSufficentFunds = function(transferMoneyContext) {
    if (this.balance() < transferMoneyContext.amount) {
      return false;
    }
    return true;
  };
  self.transferTo = function(transferMoneyContext) {
    if (!self.hasSufficentFunds.call(this, transferMoneyContext)) {
      console.log("Insufficient Funds");
      return;
    }
    withdrawMsg = "Transfer To " + transferMoneyContext.dest.accountInfo.accountID;
    accWithCtx = new AccountWithDrawContext(this, withdrawMsg, "2014-08-02 18:14", transferMoneyContext.amount);
    accWithCtx.execute();

    accDepMsg = "Transfer From " + transferMoneyContext.dest.accountInfo.accountID;
    accDepCtx = new AccountDepositContext(transferMoneyContext.dest, accDepMsg, "2014-08-02 18:14", transferMoneyContext.amount);
    accDepCtx.execute();
  };
  self.payBills = function(payBillsContext) {
    for (var i=0, len = payBillsContext.creditors.length; i < len; i++) {
      creditor = payBillsContext.creditors[i];
      tmc = new TransferMoneyContext(this, creditor, creditor.balance());
      tmc.execute();
    }
  };
  return self;
};
  
var TransferMoneyContext = function TransferMoneyContext(sourceAccount, destAccount, amount) {
  var self = this instanceof TransferMoneyContext ? this : Object.create(TransferMoneyContext.prototype);
  self.source = sourceAccount;
  self.dest = destAccount;
  self.amount = amount;
  self.execute = function() {
    TransferMoneySource().transferTo.call(sourceAccount, self);
  };
  return self;
};

var PayBillsContext = function PayBillsContext(sourceAccount, creditors) {
  var self = this instanceof PayBillsContext ? this : Object.create(PayBillsContext.prototype);
  self.source = sourceAccount;
  self.creditors = creditors;
  self.execute = function() {
    TransferMoneySource().payBills.call(sourceAccount, self);
  };
  return self;
};


function MosesTestAccountDomain() {
  var accountInfo = new AccountInfo(20403, "Miles", "Moses", 4000.30, ASSETACCOUNT);
  var entries = [];
  var accountDomain = new AccountDomain(accountInfo, entries);
  return accountDomain;
}

function KathyTestAccountDomain() {
  var accountInfo = new AccountInfo(98345, "Miles", "Kathy", 2809.01, ASSETACCOUNT);
  var entries = [];
  var accountDomain = new AccountDomain(accountInfo, entries);
  return accountDomain;
}

function CreditorTestAccountDomains()  {
  var vendor1AccountInfo = new AccountInfo(3452, "Account 1", "Vendor", 30.52, LIABILITYACCOUNT);
  var vendor1Entries = [];
  var vendor1AccountDomain = new AccountDomain(vendor1AccountInfo, vendor1Entries);
  var vendor2AccountInfo = new AccountInfo(309201, "Account 2", "Vendor", 498.22, LIABILITYACCOUNT);
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
    creditor = creditors[i];
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
  console.log("Moses Account Ending Balance = " + sourceAccount.balance().toFixed(2));
  printCreditorBalances(creditors, "Ending");
}

depositSomeCash();
withdrawSomeCash();
transferSomeCash();
transferSomeCashInsufficentFunds();
paySomeBills();
