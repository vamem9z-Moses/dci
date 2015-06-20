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
      accWithCtx = accounts.AccountWithDrawContext(this, withdrawMsg, "2014-08-02 18:14",
                                                        transferMoneyContext.amount);
      accWithCtx.execute();

      accDepMsg = "Transfer From " + transferMoneyContext.source.accountInfo.accountID.toString();
      accDepCtx = accounts.AccountDepositContext(transferMoneyContext.dest,
                                                      accDepMsg, "2014-08-02 18:14",
                                                      transferMoneyContext.amount);
      accDepCtx.execute();
    },
    payBills: function payBills(payBillsContext) {
      var creditor, tmc;
      for (var i=0, len = payBillsContext.creditors.length; i < len; i++) {
        creditor = payBillsContext.creditors[i];
        tmc = new TransferMoneyContext(this, creditor, creditor.balance());
        tmc.execute();
      }
    }
  };

  TransferMoneyContext = function TransferMoneyContext(sourceAccount, destAccount, amount) {
    var self = this instanceof TransferMoneyContext ? this : Object.create(TransferMoneyContext.prototype);
    self.source = sourceAccount;
    self.dest = destAccount;
    self.amount = amount;
    self.roleMgr = roles.RoleMgr();
    self.roleMgr.assignRole(TransferMoneySource, self.source);
    return self;
  };

  TransferMoneyContext.prototype = Object.create(Object.prototype);
  TransferMoneyContext.prototype.constructor = TransferMoneyContext;

  TransferMoneyContext.prototype.execute = function execute() {
    this.source.transferTo(this);
    this.roleMgr.removeRole(TransferMoneySource, this.source);
  };

  PayBillsContext = function PayBillsContext(sourceAccount, creditors) {
    var self = this instanceof PayBillsContext ? this : Object.create(PayBillsContext.prototype);
    self.source = sourceAccount;
    self.creditors = creditors;
    self.assignRole(TransferMoneySource, self.source);
    return self;
  };

  PayBillsContext.prototype = Object.create(Object.prototype);
  PayBillsContext.prototype.constructor = PayBillsContext;

  PayBillsContext.prototype.execute  = function execute() {
      this.source.payBills(this);
      this.removeRole(TransferMoneySource, this.source);
  };

  module.exports = { TransferMoneySource: TransferMoneySource,
    TransferMoneyContext: TransferMoneyContext,
    PayBillsContext: PayBillsContext };
})();
