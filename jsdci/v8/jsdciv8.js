(function () {
  "use strict";

  var domains = require('./domains/accounts.js');
  var constants = require('./domains/constants.js');
  var accounts = require('./roles/accountrole.js');
  var transfers = require('./roles/transfersourcerole.js');

  var MosesTestAccountDomain, KathyTestAccountDomain, Vendor1AccountDomain,
    Vendor2AccountDomain, resetAccounts, depositSomeCash, withdrawSomeCash,transferSomeCash,
    transferSomeCashInsufficentFunds, printCreditorBalances, paySomeBills;

  MosesTestAccountDomain = domains.createAccount(20403, "Miles", "Moses", 4000.30, constants.AssetAccount);
  KathyTestAccountDomain = domains.createAccount(98345, "Miles", "Kathy", 2809.01, constants.AssstAccount);
  Vendor1AccountDomain = domains.createAccount(3452, "Account 1", "Vendor", 30.52, constants.LiabilityAccount);
  Vendor2AccountDomain = domains.createAccount(309201, "Account 2", "Vendor", 498.22, constants.LiabilityAccount);

  resetAccounts = function resetAccount() {
    MosesTestAccountDomain.entries = [];
    KathyTestAccountDomain.entries = [];
    Vendor1AccountDomain.entries = [];
    Vendor2AccountDomain.enties = [];
  };

  depositSomeCash = function depositSomeCash() {
    var account, accDepCtx;

    resetAccounts();

    console.log("Deposit Some Cash");
    account = MosesTestAccountDomain;
    console.log("Moses Account Starting Balance = " + account.balance());
    accDepCtx = Object.create(accounts.AccountDepositContext);
    accDepCtx.init(account, "Initial Deposit", "2014-08-02 3:59", 500.00);
    accDepCtx.execute();
    console.log("Moses Account Ending Balance = " + account.balance() + "\n");
  };

  withdrawSomeCash = function withdrawSomeCash() {
    var account, accWithCtx;

    resetAccounts();

    console.log("Withdraw Some Cash");
    account = MosesTestAccountDomain;
    console.log("Moses Account Starting Balance = " + account.balance());
    accWithCtx = Object.create(accounts.AccountWithDrawContext);
    accWithCtx.init(account, "First Withdraw", "2014-08-02 5:56", 700.00);
    accWithCtx.execute();
    console.log("Moses Account Ending Balance = " + account.balance() + "\n");
  };

  transferSomeCash = function transferSomeCash() {
    var sourceAccount, destAccount, tmctx;

    resetAccounts();

    console.log("Transfer Some Cash");
    sourceAccount = MosesTestAccountDomain;
    destAccount = KathyTestAccountDomain;
    console.log("Moses Account Starting Balance = " + sourceAccount.balance());
    console.log("Kathy Account Starting Balance = " + destAccount.balance());
    tmctx = Object.create(transfers.TransferMoneyContext);
    tmctx.init(sourceAccount, destAccount, 400.00);
    tmctx.execute();
    console.log("Moses Account Ending Balance = " + sourceAccount.balance());
    console.log("Kathy Account Ending Balance = " + destAccount.balance() + "\n");
  };

  transferSomeCashInsufficentFunds =function transferSomeCashInsufficentFunds() {
    var sourceAccount, destAccount, tmctx;

    resetAccounts();

    console.log("Transfer Some Cash");
    sourceAccount = MosesTestAccountDomain;
    destAccount = KathyTestAccountDomain;
    console.log("Moses Account Starting Balance = " + sourceAccount.balance());
    console.log("Kathy Account Starting Balance = " + destAccount.balance());
    tmctx = Object.create(transfers.TransferMoneyContext);
    tmctx.init(sourceAccount, destAccount, 8000.00);
    tmctx.execute();
    console.log("Moses Account Ending Balance = " + sourceAccount.balance());
    console.log("Kathy Account Ending Balance = " + destAccount.balance() + "\n");
  };

  paySomeBills = function paySomeBills() {
    var sourceAccount, creditors, pbctx;

    resetAccounts();

    console.log("Pay Some Bills");
    sourceAccount = MosesTestAccountDomain;
    creditors = [Vendor1AccountDomain, Vendor2AccountDomain];
    console.log("Moses Account Starting Balance = " + sourceAccount.balance());
    printCreditorBalances(creditors, "Starting");
    pbctx = Object.create(transfers.PayBillsContext);
    pbctx.init(sourceAccount, creditors);
    pbctx.execute();
    console.log("Moses Account Ending Balance = " + sourceAccount.balance());
    printCreditorBalances(creditors, "Ending");
  };

  printCreditorBalances = function printCreditorBalances(creditors, balanceType) {
    for (var i=0, len = creditors.length; i < len; i++) {
      var creditor = creditors[i];
      console.log(creditor.accountInfo.firstName + " " + creditor.accountInfo.lastName + " " + balanceType + " Balance = " + creditor.balance());
    }
  };

  depositSomeCash();
  withdrawSomeCash();
  transferSomeCash();
  transferSomeCashInsufficentFunds();
  paySomeBills();
}());
