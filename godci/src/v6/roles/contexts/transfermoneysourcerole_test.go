package contexts

import (
	"testing"
	"v6/domains"
)

var testSourceAccount = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 1000.00,
		AccountType:     domains.ASSETACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

var testDestAccount = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 10.00,
		AccountType:     domains.ASSETACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

var vendorAccount1 = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 50.00,
		AccountType:     domains.LIABILITYACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

var vendorAccount2 = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 75.00,
		AccountType:     domains.LIABILITYACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

var transferMoneyTests = []struct {
	name          string
	sourceAccount *domains.AccountDomain
	destAccount   *domains.AccountDomain
	amount        float64
}{
	{
		name:          "Transfer Money with Adequate funds",
		sourceAccount: &testSourceAccount,
		destAccount:   &testDestAccount,
		amount:        20.00,
	},
}

var payBillsTests = []struct {
	name          string
	sourceAccount *domains.AccountDomain
	creditors     []*domains.AccountDomain
}{
	{
		name:          "Pay bills with creditor amounts < than source account",
		sourceAccount: &testSourceAccount,
		creditors:     []*domains.AccountDomain{&vendorAccount1, &vendorAccount2},
	},
}

func resetTranferAccounts() {
	testSourceAccount.Entries = make([]*domains.EntryItem, 0)
	testDestAccount.Entries = make([]*domains.EntryItem, 0)
	vendorAccount1.Entries = make([]*domains.EntryItem, 0)
	vendorAccount2.Entries = make([]*domains.EntryItem, 0)
}

func TestTransferMoneySource(t *testing.T) {
	for _, test := range transferMoneyTests {
		originalSourceBalance := test.sourceAccount.Balance()
		newSourceBalance := originalSourceBalance - test.amount
		originalDestBalance := test.destAccount.Balance()
		newDestBalance := originalDestBalance + test.amount
		accCtx := TransferMoneyContext{}
		accCtx.Initialize(test.amount, test.sourceAccount, test.destAccount)
		err := accCtx.Execute()
		if err != nil {
			t.Errorf("Test %s failed, got error: %s, expected nil",
				test.name, err.Error())
		}
		if newSourceBalance != test.sourceAccount.Balance() {
			t.Errorf("Test %s failed, source balance = %f, expected %f",
				test.name, newSourceBalance, test.sourceAccount.Balance())
		}
		if newDestBalance != test.destAccount.Balance() {
			t.Errorf("Test %s failed, dest balance = %f, expected %f",
				test.name, newDestBalance, test.destAccount.Balance())
		}
	}
}

func TestPayBills(t *testing.T) {
	for _, test := range payBillsTests {
		accCtx := PayBillsContext{}
		accCtx.Initialize(test.sourceAccount, test.creditors)
		err := accCtx.Execute()
		if err != nil {
			t.Errorf("Test %s failed, got error: %s, expected nil",
				test.name, err.Error())
		}

	}
}
