package main

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

type User struct {
	UserID    int
	LastName  string
	FirstName string
	Accounts
}

type Accounts []*AccountDomain

func (as Accounts) GetAccount(productCategory string) (*AccountDomain, error) {
	for _, a := range as {
		if a.ProductCategory == productCategory {
			return a, nil
		}

	}
	errorMsg := fmt.Sprintf("User Doesn't Have a %s Account", productCategory)
	return nil, errors.New(errorMsg)
}

func (as Accounts) GetAccountByID(acctID int) (*AccountDomain, error) {
	for _, a := range as {
		if a.AccountID == acctID {
			return a, nil
		}

	}
	errorMsg := fmt.Sprintf("User Doesn't Have %d Account", acctID)
	return nil, errors.New(errorMsg)
}

type UserCollection []*User

type UserService struct{}

func (us UserService) GetCollection() UserCollection {
	uc := make([]*User, 0)

	MosesCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       10,
			UserID:          12234,
			StartingBalance: 3090.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	MosesSavingsAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       11,
			UserID:          12234,
			StartingBalance: 20435.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: SAVINGSACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	Moses := User{
		UserID:    12234,
		LastName:  "Miles",
		FirstName: "Moses",
		Accounts:  []*AccountDomain{&MosesSavingsAccount, &MosesCheckingAccount},
	}

	KathyCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       20,
			UserID:          2394,
			StartingBalance: 5403.43,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	KathySavingsAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       21,
			UserID:          2394,
			StartingBalance: 10345.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: SAVINGSACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	Kathy := User{
		UserID:    2394,
		LastName:  "Miles",
		FirstName: "Kathy",
		Accounts:  []*AccountDomain{&KathySavingsAccount, &KathyCheckingAccount},
	}

	DavidCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       30,
			UserID:          394,
			StartingBalance: 6060.14,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	DavidVendorAccount1 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       31,
			UserID:          394,
			StartingBalance: 445.34,
			AccountType:     LIABILITYACCOUNT,
			ProductCategory: CREDITCARD,
		},
		Entries: make([]*EntryItem, 0),
	}

	DavidVendorAccount2 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       32,
			UserID:          394,
			StartingBalance: 890.34,
			AccountType:     LIABILITYACCOUNT,
			ProductCategory: CREDITCARD,
		},
		Entries: make([]*EntryItem, 0),
	}

	David := User{
		UserID:    394,
		LastName:  "Miles",
		FirstName: "David",
		Accounts:  []*AccountDomain{&DavidCheckingAccount, &DavidVendorAccount1, &DavidVendorAccount2},
	}

	uc = append(uc, &Moses, &Kathy, &David)
	return uc
}

func (us UserService) FindUser(id int) (*User, error) {
	uc := us.GetCollection()
	for _, u := range uc {
		if u.UserID == id {
			return u, nil
		}
	}
	return nil, errors.New("Cannot Find User")
}

func main() {
	us := UserService{}
	Moses, _ := us.FindUser(12234)
	Kathy, _ := us.FindUser(2394)
	TransferMoneyContextExample(Moses, Kathy)

	David, _ := us.FindUser(394)
	PayBillsContextExample(David)

}

func TransferMoneyContextExample(moses *User, kathy *User) {
	MosesAccount, _ := moses.GetAccount(CHECKINGACCOUNT)
	KathyAccount, _ := kathy.GetAccount(CHECKINGACCOUNT)

	fmt.Println("TransferMoney Context Example")
	fmt.Println("")
	fmt.Println("Moses Account - Beginning Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Beginning Balance = ", KathyAccount.Balance())
	tmc := TransferMoneyContext{}
	tmc.Initialize(20.5, MosesAccount, KathyAccount)
	tmc.Execute()
	fmt.Println("Moses Account - Middle Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Middle Balance = ", KathyAccount.Balance())
	tmc.Initialize(46000, MosesAccount, KathyAccount)
	err := tmc.Execute()
	if err != nil {
		fmt.Println(err)
	}
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
}

func PayBillsContextExample(david *User) {
	DavidAccount, _ := david.GetAccountByID(30)
	VendorAccount1, _ := david.GetAccountByID(31)
	VendorAccount2, _ := david.GetAccountByID(32)

	fmt.Println("PayBillsContext Example")
	fmt.Println("")

	fmt.Println("David Beginning Balance", DavidAccount.Balance())
	creditors := []*AccountDomain{VendorAccount1, VendorAccount2}
	pbc := PayBillsContext{}

	pbc.Initialize(DavidAccount, creditors)
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
