package dci

import (
	"errors"
	"fmt"
	"time"
)

const (
	LIABILITYACCOUNT = "liabilityaccount"
	ASSETACCOUNT     = "assetaccount"
	CREDIT           = "credit"
	DEBIT            = "debit"
	SAVINGSACCOUNT   = "savingaccount"
	CHECKINGACCOUNT  = "checkingaccount"
	CREDITCARD       = "creditcard"
)

type Contexter interface {
	ApplyRules([]BusinessRuler, Contexter) error
	Execute() error
}

type BusinessRuler interface {
	Action(Contexter) error
}

type AccountProtection struct{}

func (ap AccountProtection) Action(ctx Contexter) error {
	accCtx, ok := ctx.(*AccountWithdrawContext)
	if !ok {
		return errors.New("Not the correct context")
	}
	if !accCtx.Account.HasSufficentFunds(accCtx.Amount) {
		userID := accCtx.Account.UserID
		us := UserService{}
		user, err := us.FindUser(userID)
		if err != nil {
			return err
		}
		savingsAccount, err := user.Accounts.GetAccount(SAVINGSACCOUNT)
		if err != nil {
			return errors.New("No savings account, Insufficient funds")
		}
		if (savingsAccount.Balance() + accCtx.Account.Balance()) < accCtx.Amount {
			return errors.New("Insufficent Funds in both accounts")
		}
		transferAmt := accCtx.Amount - accCtx.Account.Balance()
		transferCtx := TransferMoneyContext{}
		transferCtx.Initialize(transferAmt, savingsAccount, accCtx.Account.AccountDomain)
		transferCtx.Execute()
	}
	return nil
}

type RulesRunner struct{}

func (rr RulesRunner) ApplyRules(rules []BusinessRuler, ctx Contexter) error {
	if len(rules) > 0 {
		for _, rule := range rules {
			err := rule.Action(ctx)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

type AccountInfo struct {
	VendorName      string
	AccountID       int
	UserID          int
	StartingBalance float64
	AccountType     string
	ProductCategory string
}

type EntryItem struct {
	AccountID       int
	Date            time.Time
	Message         string
	Amount          float64
	TransactionType string
}

type AccountDomain struct {
	*AccountInfo
	Entries []*EntryItem
}

func (accDomain *AccountDomain) Balance() float64 {
	currentBalance := accDomain.StartingBalance
	for _, entry := range accDomain.Entries {
		switch entry.TransactionType {
		case CREDIT:
			currentBalance += entry.Amount
		case DEBIT:
			currentBalance -= entry.Amount
		}
	}
	return currentBalance
}

func (accDomain *AccountDomain) HasSufficentFunds(amount float64) bool {
	if accDomain.Balance() < amount {
		return false
	}
	return true
}

func (ad *AccountDomain) RecordTransaction(message string, date time.Time, amt float64, transtype string) {
	er := &EntryItem{
		AccountID:       ad.AccountID,
		Date:            date,
		Amount:          amt,
		TransactionType: transtype,
		Message:         message,
	}
	ad.Entries = append(ad.Entries, er)
}

type AccountRole struct {
	*AccountDomain
}

func (accRole *AccountRole) Deposit(accCtx *AccountDepositContext) {
	var transType string

	switch accCtx.Account.AccountType {
	case ASSETACCOUNT:
		transType = CREDIT
	case LIABILITYACCOUNT:
		transType = DEBIT
	}
	accRole.RecordTransaction(accCtx.Message, accCtx.EntryTime, accCtx.Amount, transType)
}

func (accRole *AccountRole) Withdraw(accCtx *AccountWithdrawContext) error {
	if !accRole.HasSufficentFunds(accCtx.Amount) {
		return errors.New("Insuffient Funds for Withdrawal")
	}

	var transType string

	switch accCtx.Account.AccountType {
	case ASSETACCOUNT:
		transType = DEBIT
	case LIABILITYACCOUNT:
		transType = CREDIT
	}
	accRole.RecordTransaction(accCtx.Message, accCtx.EntryTime, accCtx.Amount, transType)
	return nil
}

type TransferMoneySource struct {
	*AccountDomain
}

func (tms *TransferMoneySource) TransferTo(ctx *TransferMoneyContext) error {
	accWithdrawCtx := AccountWithdrawContext{}
	accWithdrawCtx.Initialize(ctx.SourceAccount.AccountDomain,
		fmt.Sprintf("Transfer Out %g to %d", ctx.Amount,
			ctx.DestAccount.AccountID), time.Now().UTC(), ctx.Amount)
	err := accWithdrawCtx.Execute()
	if err != nil {
		return err
	}

	accDepositCtx := AccountDepositContext{}
	accDepositCtx.Initialize(ctx.DestAccount,
		fmt.Sprintf("Transfer In %g from %d", ctx.Amount,
			ctx.SourceAccount.AccountID), time.Now().UTC(), ctx.Amount)
	accDepositCtx.Execute()
	return nil
}

func (tms *TransferMoneySource) PayBills(pbc *PayBillsContext) {
	for _, creditor := range pbc.Creditors {
		tmc := TransferMoneyContext{}
		tmc.Initialize(creditor.Balance(), pbc.SourceAccount.AccountDomain, creditor)
		tmc.Execute()
	}
}

type AccountWithdrawContext struct {
	Account       *AccountRole
	Message       string
	EntryTime     time.Time
	Amount        float64
	BusinessRules []BusinessRuler
	RulesRunner
}

func (accCtx *AccountWithdrawContext) Initialize(ad *AccountDomain, msg string, entryTime time.Time, amount float64) {
	accCtx.Account = &AccountRole{AccountDomain: ad}
	accCtx.Message = msg
	accCtx.EntryTime = entryTime
	accCtx.Amount = amount
	accCtx.BusinessRules = []BusinessRuler{AccountProtection{}}
	accCtx.RulesRunner = RulesRunner{}
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

func (accCtx *AccountDepositContext) Initialize(ad *AccountDomain, msg string, entryTime time.Time, amount float64) {
	accCtx.Account = &AccountRole{AccountDomain: ad}
	accCtx.Message = msg
	accCtx.EntryTime = entryTime
	accCtx.Amount = amount

}

func (accCtx *AccountDepositContext) Execute() {
	accCtx.Account.Deposit(accCtx)
}

type TransferMoneyContext struct {
	Amount        float64
	SourceAccount TransferMoneySource
	DestAccount   *AccountDomain
}

func (ctx *TransferMoneyContext) Initialize(amt float64, source *AccountDomain, dest *AccountDomain) {
	ctx.SourceAccount = TransferMoneySource{AccountDomain: source}
	ctx.DestAccount = dest
	ctx.Amount = amt
}

func (ctx *TransferMoneyContext) Execute() error {
	err := ctx.SourceAccount.TransferTo(ctx)
	if err != nil {
		return err
	}
	return nil
}

type PayBillsContext struct {
	SourceAccount TransferMoneySource
	Creditors     []*AccountDomain
}

func (pbc *PayBillsContext) Initialize(source *AccountDomain, creditAccts []*AccountDomain) {
	pbc.SourceAccount = TransferMoneySource{AccountDomain: source}
	pbc.Creditors = creditAccts

}

func (pbc *PayBillsContext) Execute() {
	pbc.SourceAccount.PayBills(pbc)
}
