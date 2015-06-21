(function() {
  "use strict";

  var accounts = require('./accountrole.js');
  var roles = require('./roles.js');

  var TransferMoneySource, TransferMoneyContext, PayBillsContext;

  TransferMoneySource = {
    roleRequirements: function roleRequirements() {
      return ['accountInfo', 'entries'];
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
        return;
      }

      withdrawMsg = "Transfer To " + transferMoneyContext.dest.accountInfo.accountID.toString();
      accWithCtx = Object.create(accounts.AccountWithDrawContext);
      accWithCtx.init(this, withdrawMsg, "2014-08-02 18:14", transferMoneyContext.amount);
      accWithCtx.execute();

      accDepMsg = "Transfer From " + transferMoneyContext.source.accountInfo.accountID.toString();
      accDepCtx = Object.create(accounts.AccountDepositContext);
      accDepCtx.init(transferMoneyContext.dest, accDepMsg, "2014-08-02 18:14",
                     transferMoneyContext.amount);
      accDepCtx.execute();
    },
    payBills: function payBills(payBillsContext) {
      var creditor, tmc;

      for (var i=0, len = payBillsContext.creditors.length; i < len; i++) {
        creditor = payBillsContext.creditors[i];
        tmc = Object.create(TransferMoneyContext);
        tmc.init(payBillsContext.source, creditor, creditor.balance());
        tmc.execute();
      }
    }
  };

  TransferMoneyContext = {
    init: function init(sourceAccount, destAccount, amount) {
      this.source = sourceAccount;
      this.dest = destAccount;
      this.amount = amount;
      roles.RoleMgr.assignRole(TransferMoneySource, this.source);
    },
    execute: function execute() {
      this.source.transferTo(this);
      roles.RoleMgr.removeRole(TransferMoneySource, this.source);
    }
  };

  PayBillsContext = {
    init: function init(sourceAccount, creditors) {
      this.source = sourceAccount;
      this.creditors = creditors;
      roles.RoleMgr.assignRole(TransferMoneySource, this.source);
    },
    execute: function execute() {
      this.source.payBills(this);
      roles.RoleMgr.removeRole(TransferMoneySource, this.source);
    }
  };

  module.exports = { TransferMoneySource: TransferMoneySource,
    TransferMoneyContext: TransferMoneyContext,
    PayBillsContext: PayBillsContext };
})();
