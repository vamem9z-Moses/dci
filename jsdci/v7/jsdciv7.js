(function () {
  "use strict";

  var domains = require('./domains/accounts.js');
  var constants = require('./domains/constants.js');
  var accounts = require('./roles/accountrole.js');
  var transfers = require('./roles/transfersourcerole.js');

  function MosesTestAccountDomain() {
    var accountInfo = domains.AccountInfo(20403, "Miles", "Moses", 4000.30, constants.AssetAccount);
    var entries = [];
    var accountDomain = domains.AccountDomain(accountInfo, entries);
    return accountDomain;
  }

  function KathyTestAccountDomain() {
    var accountInfo = new domains.AccountInfo(98345, "Miles", "Kathy", 2809.01, constants.AssstAccount);
    var entries = [];
    var accountDomain = new domains.AccountDomain(accountInfo, entries);
    return accountDomain;
  }

  function CreditorTestAccountDomains()  {
    var vendor1AccountInfo = new domains.AccountInfo(3452, "Account 1", "Vendor", 30.52, constants.LiabilityAccount);
    var vendor1Entries = [];
    var vendor1AccountDomain = new domains.AccountDomain(vendor1AccountInfo, vendor1Entries);
    var vendor2AccountInfo = new domains.AccountInfo(309201, "Account 2", "Vendor", 498.22, constants.LiabilityAccount);
    var vendor2Entries = [];
    var vendor2AccountDomain = new domains.AccountDomain(vendor2AccountInfo, vendor2Entries);
    var creditors = [vendor1AccountDomain, vendor2AccountDomain];
    return creditors;
  }

  function depositSomeCash() {
    console.log("Deposit Some Cash");
    var account = new MosesTestAccountDomain();
    console.log("Moses Account Starting Balance = " + account.balance());
    var accDepCtx = new accounts.AccountDepositContext(account, "Initial Deposit", "2014-08-02 3:59", 500.00);
    accDepCtx.execute();
    console.log("Moses Account Ending Balance = " + account.balance() + "\n");
  }

  function withdrawSomeCash() {
    console.log("Withdraw Some Cash");
    var account = new MosesTestAccountDomain();
    console.log("Moses Account Starting Balance = " + account.balance());
    var accWithCtx = new accounts.AccountWithDrawContext(account, "First Withdraw", "2014-08-02 5:56", 700.00);
    accWithCtx.execute();
    console.log("Moses Account Ending Balance = " + account.balance() + "\n");
  }

  function transferSomeCash() {
    console.log("Transfer Some Cash");
    var sourceAccount = new MosesTestAccountDomain();
    var destAccount = new KathyTestAccountDomain();
    console.log("Moses Account Starting Balance = " + sourceAccount.balance());
    console.log("Kathy Account Starting Balance = " + destAccount.balance());
    var tmctx = new transfers.TransferMoneyContext(sourceAccount, destAccount, 400.00);
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
    var tmctx = new transfers.TransferMoneyContext(sourceAccount, destAccount, 8000.00);
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
    var pbctx = new transfers.PayBillsContext(sourceAccount, creditors);
    pbctx.execute();
    console.log("Moses Account Ending Balance = " + sourceAccount.balance());
    printCreditorBalances(creditors, "Ending");
  }

  depositSomeCash();
  withdrawSomeCash();
  transferSomeCash();
  transferSomeCashInsufficentFunds();
  paySomeBills();
}());
