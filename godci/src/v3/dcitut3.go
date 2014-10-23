package main

import (
	"time"
	"fmt"
)

const (
	LIABILITYACCOUNT = "liabilityaccount"
	ASSETACCOUNT = "assetaccount"
	CREDIT string = "credit"
	DEBIT string = "debit"
)

type AccountInfo struct {
	accountID int
	lastName string
	firstName string
	startingBalance float64
	accountType string
}


type EntryItem struct {
	accountID int
	date time.Time
	message string
	amount float64
	transactionType string
}

type AccountContext struct {
	AccountInfo
	entries []EntryItem
}


func (accCtx *AccountContext) Initialize(actInfoID int) {
	accCtx.LookupAccount(actInfoID)
	accCtx.LookupEntries(actInfoID)		
}

func (accCtx *AccountContext) LookupAccount(actInfoID int) {
	accInfo1 := AccountInfo{ accountID: 12345, lastName: "Miles", 
				firstName: "Moses", startingBalance: 5345.45, 
				accountType: ASSETACCOUNT, }
	accInfo2 := AccountInfo{ accountID: 492945, lastName: "Miles",  
				firstName: "Kathy", startingBalance: 3958.28, 
				accountType: ASSETACCOUNT,  }
	accounts := []AccountInfo{ accInfo1, accInfo2 }
	for _,account := range accounts {
		if account.accountID == actInfoID {
			accCtx.AccountInfo = account;
			return
		}
	}
	fmt.Println("Could not find account %g ",  actInfoID) 

}

func (accCtx *AccountContext) LookupEntries(actInfoID int) {
	if (actInfoID == 12345) {
		entry1 := EntryItem{  
					accountID: 12345, 
					date: time.Now().UTC(),
					message: "Transfer In 300.00 from Entry1",
					amount: 300.00,
					transactionType: CREDIT, 
				}
		entry2 := EntryItem {
					accountID: 12345,
					date: time.Now().UTC(),
					message: "Transfer Out 535.45 to Entry2",
					amount: 535.45,
					transactionType: DEBIT,
				}
		accCtx.entries = []EntryItem{ entry1, entry2}
	}	
	if (actInfoID == 492945) {
		entry1 := EntryItem{ 	 
					accountID:492945, 
					date: time.Now().UTC(),
					message: "Transfer In 902.23 from Entry1",
					amount: 902.23,
					transactionType: CREDIT, 
				}
		entry2 := EntryItem {
					accountID: 492945,
					date: time.Now().UTC(),
					message: "Transfer Out 135.45 to Entry2",
					amount: 135.45,
					transactionType: DEBIT,
				}
		accCtx.entries = []EntryItem{ entry1, entry2}
	
	}
}

func (accCtx *AccountContext) Deposit(message string, logTime time.Time, amount float64) {
	var transType string

	switch accCtx.accountType {
		case ASSETACCOUNT: transType = CREDIT
		case LIABILITYACCOUNT: transType = DEBIT 
	}
	entry := EntryItem{ 
				accountID: accCtx.accountID,
				date: logTime,
				message: message,
				amount: amount,
				transactionType: transType,
			}
	accCtx.entries = append(accCtx.entries, entry)
}	

func (accCtx *AccountContext) Withdrawal(message string, logTime time.Time, amount float64) { 
	var transType string
	switch accCtx.accountType {
		case ASSETACCOUNT: transType = DEBIT
		case LIABILITYACCOUNT: transType = CREDIT 
	}
	entry := EntryItem{ 
				accountID: accCtx.accountID,
				date: logTime,
				message: message,
				amount: amount,
				transactionType: transType,
			}
	accCtx.entries = append(accCtx.entries, entry)
}

func (accCtx *AccountContext) Balance() float64 {
	currentBalance := accCtx.startingBalance
	for _,entry := range accCtx.entries {
		switch entry.transactionType {
			case CREDIT: currentBalance +=entry.amount
			case DEBIT: currentBalance -=entry.amount
		}
	}
	return currentBalance
}

type TransferMoneyContext struct {
	amount float64
	sourceAccount TransferMoneySource
	destAccount *AccountContext
}

func (ctx *TransferMoneyContext) Initialize(amt float64, source *AccountContext, dest *AccountContext) {
	ctx.sourceAccount = TransferMoneySource{AccountContext: source}
	ctx.destAccount = dest
	ctx.amount = amt
} 

func (ctx *TransferMoneyContext) Execute() {
	ctx.sourceAccount.TransferTo(ctx)
}

type TransferMoneySource struct {
	*AccountContext
}

func (tms *TransferMoneySource) TransferTo(ctx *TransferMoneyContext) {
	if (!tms.HasSufficentFunds(ctx)) {
		fmt.Println("Insufficient Funds")
		return
	}		
	tms.Withdrawal(fmt.Sprintf("Transfer Out %g to %s %s", ctx.amount, ctx.destAccount.firstName, ctx.destAccount.lastName), time.Now().UTC(), ctx.amount)
	ctx.destAccount.Deposit(fmt.Sprintf("Transfer In %g from %s %s ", ctx.amount, tms.firstName, tms.lastName), time.Now(), ctx.amount)
}

func (tms *TransferMoneySource) HasSufficentFunds(ctx *TransferMoneyContext) bool {
	if tms.Balance() < ctx.amount {
		return false	
	}
	return true
}

func (tms *TransferMoneySource) PayBills(pbc *PayBillsContext) {
	for _,creditor := range pbc.creditors {
		tmc := TransferMoneyContext {}
		tmc.Initialize(creditor.Balance(), tms.AccountContext, creditor)
		tmc.Execute()
	}
}

type PayBillsContext struct {
	sourceAccount TransferMoneySource
	creditors []*AccountContext
}

func (pbc *PayBillsContext) Initialize(source *AccountContext, creditAccts []*AccountContext)  {
	pbc.sourceAccount = TransferMoneySource{AccountContext: source}
	pbc.creditors = creditAccts
		
}


func (pbc *PayBillsContext) Execute() {
	pbc.sourceAccount.PayBills(pbc)
}

func main() {

	fmt.Println("Examples")
	fmt.Println("")
	fmt.Println("TransferMoneyContext Example")
	fmt.Println("")

	MosesAccount := AccountContext{}
	MosesAccount.Initialize(12345)
	KathyAccount := AccountContext{}
	KathyAccount.Initialize(492945)
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
	for _,transaction := range MosesAccount.entries {
		fmt.Println(transaction.message)
	}

	fmt.Println("")
	fmt.Println("Kathy Account Transactions")
	for _,transaction := range KathyAccount.entries {
		fmt.Println(transaction.message)
	}


	DavidAccount := AccountContext { 
		AccountInfo: AccountInfo {
		accountID: 150694,
		lastName: "Miles",
		firstName: "David",
		startingBalance: 6060.14,
		accountType: ASSETACCOUNT,
		},
		entries: make([]EntryItem,0),
	}
	VendorAccount1 := AccountContext { 
		AccountInfo: AccountInfo {
			accountID: 403053,
			lastName: "Account1",
			firstName: "Vendor",
			startingBalance: 445.34,
			accountType: LIABILITYACCOUNT,

		},
			entries: make([]EntryItem,0),
	}
	
	VendorAccount2 := AccountContext {
		AccountInfo: AccountInfo {
			accountID: 403053,
			lastName: "Account2",
			firstName: "Vendor",
			startingBalance: 890.34,
			accountType: LIABILITYACCOUNT,

		},
			entries: make([]EntryItem,0),
	}
	fmt.Println("")
	fmt.Println("PayBillsContext Example")
	fmt.Println("")

	fmt.Println("David Beginning Balance", DavidAccount.Balance())
	creditors := []*AccountContext{&VendorAccount1, &VendorAccount2}
	pbc := PayBillsContext{} 
	
	pbc.Initialize(&DavidAccount, creditors)
	pbc.Execute()
	fmt.Println("David Ending Balance", DavidAccount.Balance())
	fmt.Println("VendorAccount1 Ending Balance", VendorAccount1.Balance())
	fmt.Println("VendorAccount2 Ending Balance", VendorAccount2.Balance())

	fmt.Println("")
	fmt.Println("David Account Transactions")
	for _,transaction := range DavidAccount.entries {
		fmt.Println(transaction.message)
	}
}	

