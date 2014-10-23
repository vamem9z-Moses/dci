package main

import "time"

type Account struct {
	Balance float64;
}


func (act *Account) updateLog(message string, time time.Time, amt float64) {
}

func (act *Account) withdraw(amt float64) { act.Balance -= amt }
func (act *Account) deposit(amt float64) { act.Balance += amt }

type TransferMoneyContext struct {
	sourceAccount *Account
	destAccount *Account
	amount float64
}

func (ctx *TransferMoneyContext) Initialize(amt float64, source *Account, dest *Account) {
	ctx.sourceAccount = source
	ctx.destAccount = dest
	ctx.amount = amt
} 

type TransferMoneySource struct {
	*Account
	*TransferMoneyContext
}

func (tms *TransferMoneySource) TransferTo() {
	tms.Account = tms.TransferMoneyContext.sourceAccount
	origDestBal := tms.destAccount.Balance
	if (tms.HasSufficentFunds()) {
		tms.withdraw(tms.amount)
		tms.destAccount.deposit(tms.amount)
		tms.updateLog("Transfer Out", time.Now(), tms.amount)
		tms.destAccount.updateLog("Transfer In", time.Now(), tms.amount)
	}
	expectedBalance := tms.sourceAccount.Balance + origDestBal
	if (tms.destAccount.Balance != expectedBalance)  {
		//Rollback
		//Send Error	
	}
}

func (tms *TransferMoneySource) HasSufficentFunds() bool {
	if tms.Balance < tms.TransferMoneyContext.amount {
		return false	
	}
	return true
}

func main() {
	MosesAccount := Account{Balance : 34.5}
	KathyAccount := Account{Balance : 90.4}
	tmc := TransferMoneyContext{
		sourceAccount: &MosesAccount,
		destAccount: &KathyAccount, 
		amount: 65.5,
	}
	tms := TransferMoneySource{
		TransferMoneyContext: &tmc,
	}
	tms.TransferTo()
							
}
