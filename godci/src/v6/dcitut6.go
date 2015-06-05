package main

import (
	"fmt"
	"v6/dci"
)

func main() {
	us := dci.UserService{}
	Moses, _ := us.FindUser(12234)
	Kathy, _ := us.FindUser(2394)
	TransferMoneyContextExample(Moses, Kathy)

	David, _ := us.FindUser(394)
	PayBillsContextExample(David)

}
func TransferMoneyContextExample(moses *dci.User, kathy *dci.User) {
	MosesAccount, _ := moses.GetAccount(dci.CHECKINGACCOUNT)
	KathyAccount, _ := kathy.GetAccount(dci.CHECKINGACCOUNT)

	fmt.Println("TransferMoney Context Example")
	fmt.Println("")
	fmt.Println("Moses Account - Beginning Balance = ", MosesAccount.Balance())
	fmt.Println("Kathy Account - Beginning Balance = ", KathyAccount.Balance())
	tmc := dci.TransferMoneyContext{}
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

func PayBillsContextExample(david *dci.User) {
	DavidAccount, _ := david.GetAccountByID(30)
	VendorAccount1, _ := david.GetAccountByID(31)
	VendorAccount2, _ := david.GetAccountByID(32)

	fmt.Println("PayBillsContext Example")
	fmt.Println("")

	fmt.Println("David Beginning Balance", DavidAccount.Balance())
	creditors := []*dci.AccountDomain{VendorAccount1, VendorAccount2}
	pbc := dci.PayBillsContext{}

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
