package contexts

import (
	"time"
	"v6/domains"
	"v6/roles/rules"
)

type AccountRole struct {
	*domains.AccountDomain
}

func (accRole *AccountRole) Deposit(accCtx *AccountDepositContext) {
	var transType string

	switch accCtx.Account.AccountType {
	case domains.ASSETACCOUNT:
		transType = domains.CREDIT
	case domains.LIABILITYACCOUNT:
		transType = domains.DEBIT
	}
	accRole.RecordTransaction(accCtx.Message, accCtx.EntryTime, accCtx.Amount, transType)
}

func (accRole *AccountRole) Withdraw(accCtx *AccountWithdrawContext) {
	var transType string

	switch accCtx.Account.AccountType {
	case domains.ASSETACCOUNT:
		transType = domains.DEBIT
	case domains.LIABILITYACCOUNT:
		transType = domains.CREDIT
	}
	accRole.RecordTransaction(accCtx.Message, accCtx.EntryTime, accCtx.Amount, transType)
}

type AccountWithdrawContext struct {
	Account       *AccountRole
	Message       string
	EntryTime     time.Time
	Amount        float64
	BusinessRules []rules.BusinessRuler
	rules.RulesRunner
}

func (accCtx *AccountWithdrawContext) Initialize(ad *domains.AccountDomain, msg string, entryTime time.Time, amount float64) {
	accCtx.Account = &AccountRole{AccountDomain: ad}
	accCtx.Message = msg
	accCtx.EntryTime = entryTime
	accCtx.Amount = amount
	accCtx.BusinessRules = []rules.BusinessRuler{AccountProtection{}}
	accCtx.RulesRunner = rules.RulesRunner{}
}

func (accCtx *AccountWithdrawContext) Execute() error {
	err := accCtx.ApplyRules(accCtx.BusinessRules, accCtx)
	if err != nil {
		return err
	}
	accCtx.Account.Withdraw(accCtx)
	return nil
}

type AccountDepositContext struct {
	Account   *AccountRole
	Message   string
	EntryTime time.Time
	Amount    float64
}

func (accCtx *AccountDepositContext) Initialize(ad *domains.AccountDomain, msg string, entryTime time.Time, amount float64) {
	accCtx.Account = &AccountRole{AccountDomain: ad}
	accCtx.Message = msg
	accCtx.EntryTime = entryTime
	accCtx.Amount = amount

}

func (accCtx *AccountDepositContext) Execute() {
	accCtx.Account.Deposit(accCtx)
}
