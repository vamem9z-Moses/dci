package contexts

import (
	"errors"
	"v6/data"
	"v6/domains"
	"v6/rules"
)

type AccountProtection struct{}

func (ap AccountProtection) Action(ctx rules.Contexter) error {
	accCtx, ok := ctx.(*AccountWithdrawContext)
	if !ok {
		return errors.New("Not the correct context")
	}
	if !accCtx.Account.HasSufficentFunds(accCtx.Amount) {
		userID := accCtx.Account.UserID
		us := data.UserService{}
		user, err := us.FindUser(userID)
		if err != nil {
			return err
		}
		savingsAccount, err := user.Accounts.GetAccount(domains.SAVINGSACCOUNT)
		if err != nil {
			return errors.New("No savings account, Insufficient funds")
		}
		if (savingsAccount.Balance() + accCtx.Account.Balance()) < accCtx.Amount {
			return errors.New("Insufficient funds in both accounts")
		}
		transferAmt := accCtx.Amount - accCtx.Account.Balance()
		transferCtx := TransferMoneyContext{}
		transferCtx.Initialize(transferAmt, savingsAccount, accCtx.Account.AccountDomain)
		transferCtx.Execute()
	}
	return nil
}
