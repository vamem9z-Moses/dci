package main

import (
	"time"
	"log"
	"fmt"
)

type Account interface {
	updateLog(messsage string, time time.Time, amt float64)
	withdraw(amt float64)
	deposit(amt float64)
	Balance() (float64)
}

type CheckingAccount struct {
	balance float64;
}

func (act *CheckingAccount) updateLog(message string, time time.Time, amt float64) {
	log.Printf(message + ", %g, " + time.String(), amt)
}

func (act *CheckingAccount) withdraw(amt float64) { act.balance -= amt }
func (act *CheckingAccount) deposit(amt float64) { act.balance += amt }
func (act *CheckingAccount) Balance() float64 { return act.balance } 

type TransferMoneyContext struct {
	sourceAccount TransferMoneySource
	destAccount Account
	amount float64
}

func (ctx *TransferMoneyContext) Initialize(amt float64, source Account, dest Account) {
	ctx.sourceAccount = TransferMoneySource{Account: source}
	ctx.destAccount = dest
	ctx.amount = amt
} 

func (ctx *TransferMoneyContext) Execute() {
	ctx.sourceAccount.TransferTo(ctx)
}

type TransferMoneySource struct {
	Account
}

func (tms *TransferMoneySource) TransferTo(ctx *TransferMoneyContext) {
	origDestBal := ctx.destAccount.Balance()
	if (!tms.HasSufficentFunds(ctx)) {
		fmt.Println("Insufficient Funds")
		return
	}		
	tms.withdraw(ctx.amount)
	ctx.destAccount.deposit(ctx.amount)
	tms.updateLog("Transfer Out", time.Now(), ctx.amount)
	ctx.destAccount.updateLog("Transfer In", time.Now(), ctx.amount)
	expectedbalance := tms.Balance() + origDestBal
	if (ctx.destAccount.Balance() != expectedbalance)  {
		//Rollback
		//Send Error	
	}
}

func (tms *TransferMoneySource) HasSufficentFunds(ctx *TransferMoneyContext) bool {
	if tms.Balance() < ctx.amount {
		return false	
	}
	return true
}

func (tms *TransferMoneySource) PayBills(pbc *PayBillsContext) {
	for _,creditor := range *pbc.creditors {
		fmt.Println("Creditor Starting Balance = ", creditor.Balance()) 
		tmc := TransferMoneyContext {}
		tmc.Initialize(creditor.Balance(), pbc.sourceAccount, &creditor)
		tmc.Execute()
		fmt.Println("Creditor Ending Balance =", creditor.Balance())
		
	}
}

type Creditor struct {
	balance float64

}

func (creditor *Creditor) deposit(amount float64) { creditor.paybill(amount) }
func (creditor *Creditor) paybill(amount float64) { creditor.balance -= amount }
func (creditor *Creditor) withdraw(amount float64) { creditor.borrow(amount) }
func (creditor *Creditor) borrow(amount float64) { creditor.balance += amount }
func (creditor *Creditor) Balance() float64 { return creditor.balance }
func (creditor *Creditor) updateLog(message string, time time.Time, amt float64 ) {
	log.Printf(message + ", %g, " + time.String(), amt)
}

type PayBillsContext struct {
	sourceAccount TransferMoneySource
	creditors *[]Creditor
}

func (pbc *PayBillsContext) Initialize(source Account, creditAccts *[]Creditor)  {
	pbc.sourceAccount = TransferMoneySource{Account: source}
	pbc.creditors = creditAccts
		
}


func (pbc *PayBillsContext) Execute() {
	pbc.sourceAccount.PayBills(pbc)
}

func main() {
	MosesAccount := CheckingAccount{balance : 34.5}
	KathyAccount := CheckingAccount{balance : 90.4}
	fmt.Println("Moses Account = ", MosesAccount.balance)
	fmt.Println("Kathy Account = ", KathyAccount.balance)
	tmc := TransferMoneyContext{}
	tmc.Initialize(20.5, &MosesAccount, &KathyAccount)	
	tmc.Execute()
	fmt.Println("Moses Account = ", MosesAccount.balance)
	fmt.Println("Kathy Account = ", KathyAccount.balance)
	tmc.Initialize(30, &MosesAccount, &KathyAccount)
	tmc.Execute()
	DavidAccount := CheckingAccount{balance: 3500.23}
	VendorAccount1 := Creditor{balance: 340.75}
	VendorAccount2 := Creditor{balance: 56.48}
	VendorAccount3 := Creditor{balance: 5000.00}
	fmt.Println("David Account - Starting  = ", DavidAccount.balance)
	creditors := []Creditor { VendorAccount1, VendorAccount2, VendorAccount3}
	pbc := PayBillsContext{}
	pbc.Initialize(&DavidAccount, &creditors)
	pbc.Execute()
	fmt.Println("David Account - Ending  = ", DavidAccount.balance)
}	
