package main

import (
	"fmt"
	"time"
)

const (
	LIABILITYACCOUNT        = "liabilityaccount"
	ASSETACCOUNT            = "assetaccount"
	CREDIT                  = "credit"
	DEBIT                   = "debit"
)

type AccountInfo struct {
	AccountID       int
	LastName        string
	FirstName       string
	StartingBalance float64
	AccountType     string
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
	entry := EntryItem{
		AccountID:       accCtx.Account.AccountID,
		Date:            accCtx.EntryTime,
		Message:         accCtx.Message,
		Amount:          accCtx.Amount,
		TransactionType: transType,
	}
	accCtx.Account.Entries = append(accCtx.Account.Entries, &entry)
}

func (accRole *AccountRole) Withdraw(accCtx *AccountWithdrawContext) {
	var transType string
	
	switch accCtx.Account.AccountType {
	case ASSETACCOUNT:
		transType = DEBIT
	case LIABILITYACCOUNT:
		transType = CREDIT
	}
	entry := EntryItem{
		AccountID:       accCtx.Account.AccountID,
		Date:            accCtx.EntryTime,
		Message:         accCtx.Message,
		Amount:          accCtx.Amount,
		TransactionType: transType,
	}
	accCtx.Account.Entries = append(accCtx.Account.Entries, &entry)
}

type AccountWithdrawContext struct {
	Account   *AccountRole
	Message   string
	EntryTime time.Time
	Amount    float64
}

func (accCtx *AccountWithdrawContext) Initialize(ad *AccountDomain, msg string, entryTime time.Time, amount float64) {
	accCtx.Account = &AccountRole{AccountDomain: ad}
	accCtx.Message = msg
	accCtx.EntryTime = entryTime
	accCtx.Amount = amount
}

func (accCtx *AccountWithdrawContext) Execute() {
	accCtx.Account.Withdraw(accCtx)
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

func (ctx *TransferMoneyContext) Execute() {
	ctx.SourceAccount.TransferTo(ctx)
}

type TransferMoneySource struct {
	*AccountDomain
}

func (tms *TransferMoneySource) TransferTo(ctx *TransferMoneyContext) {
	if !ctx.SourceAccount.HasSufficentFunds(ctx) {
		fmt.Println("Insufficient Funds")
		return
	}
	accWithdrawCtx := AccountWithdrawContext{}
	accWithdrawCtx.Initialize(ctx.SourceAccount.AccountDomain, fmt.Sprintf("Transfer Out %g to %s %s", ctx.Amount, ctx.DestAccount.FirstName, ctx.DestAccount.LastName), time.Now().UTC(), ctx.Amount)
	accWithdrawCtx.Execute()

	accDepositCtx := AccountDepositContext{}
	accDepositCtx.Initialize(ctx.DestAccount, fmt.Sprintf("Transfer In %g from %s %s ", ctx.Amount, ctx.SourceAccount.FirstName, ctx.SourceAccount.LastName), time.Now().UTC(), ctx.Amount)
	accDepositCtx.Execute()
}

func (tms *TransferMoneySource) HasSufficentFunds(ctx *TransferMoneyContext) bool {
	if ctx.SourceAccount.Balance() < ctx.Amount {
		return false
	}
	return true
}

func (tms *TransferMoneySource) PayBills(pbc *PayBillsContext) {
	for _, creditor := range pbc.Creditors {
		tmc := TransferMoneyContext{}
		tmc.Initialize(creditor.Balance(), pbc.SourceAccount.AccountDomain, creditor)
		tmc.Execute()
	}
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

func main() {

	fmt.Println("Examples")
	fmt.Println("")
	fmt.Println("TransferMoneyContext Example")
	fmt.Println("")

	MosesAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			StartingBalance: 3090.50,
			FirstName:       "Moses",
			LastName:        "Miles",
			AccountType:     ASSETACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	KathyAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			StartingBalance: 5403.43,
			FirstName:       "Kathy",
			LastName:        "Miles",
			AccountType:     ASSETACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}
	fmt.Println("Moses Account - Beginning Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Beginning Balance = ", KathyAccount.Balance())
	tmc := TransferMoneyContext{}
	tmc.Initialize(20.5, &MosesAccount, &KathyAccount)
	tmc.Execute()
	fmt.Println("Moses Account - Middle Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Middle Balance = ", KathyAccount.Balance())
	tmc.Initialize(6000, &MosesAccount, &KathyAccount)
	tmc.Execute()
	fmt.Println("Moses Account - Ending Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Ending Balance = ", KathyAccount.Balance())

	fmt.Println("")
	fmt.Println("Moses Account Transactions")
	for _, transaction := range MosesAccount.Entries {
		fmt.Println(transaction.Message)
	}

	fmt.Println("")
	fmt.Println("Kathy Account Transactions")
	for _, transaction := range KathyAccount.Entries {
		fmt.Println(transaction.Message)
	}

	DavidAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       150694,
			LastName:        "Miles",
			FirstName:       "David",
			StartingBalance: 6060.14,
			AccountType:     ASSETACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}
	VendorAccount1 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       403053,
			LastName:        "Account1",
			FirstName:       "Vendor",
			StartingBalance: 445.34,
			AccountType:     LIABILITYACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	VendorAccount2 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       403053,
			LastName:        "Account2",
			FirstName:       "Vendor",
			StartingBalance: 890.34,
			AccountType:     LIABILITYACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}
	fmt.Println("")
	fmt.Println("PayBillsContext Example")
	fmt.Println("")

	fmt.Println("David Beginning Balance", DavidAccount.Balance())
	creditors := []*AccountDomain{&VendorAccount1, &VendorAccount2}
	pbc := PayBillsContext{}

	pbc.Initialize(&DavidAccount, creditors)
	pbc.Execute()
	fmt.Println("David Ending Balance", DavidAccount.Balance())
	fmt.Println("VendorAccount1 Ending Balance", VendorAccount1.Balance())
	fmt.Println("VendorAccount2 Ending Balance", VendorAccount2.Balance())

	fmt.Println("")
	fmt.Println("David Account Transactions")
	for _, transaction := range DavidAccount.Entries {
		fmt.Println(transaction.Message)
	}
}
