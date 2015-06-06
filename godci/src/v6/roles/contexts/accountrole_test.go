package contexts

import (
	"testing"
	"time"
	"v6/domains"
)

var assetAccount = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 100.00,
		AccountType:     domains.ASSETACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

var liabilityAccount = domains.AccountDomain{
	AccountInfo: &domains.AccountInfo{
		StartingBalance: 200.00,
		AccountType:     domains.LIABILITYACCOUNT,
	},
	Entries: make([]*domains.EntryItem, 0),
}

func resetAccounts() {
	assetAccount.Entries = make([]*domains.EntryItem, 0)
	liabilityAccount.Entries = make([]*domains.EntryItem, 0)
}

var depositTests = []struct {
	name    string
	account *domains.AccountDomain
	amount  float64
	result  float64
}{
	{
		name:    "Asset account deposit test",
		account: &assetAccount,
		amount:  10.84,
		result:  110.84,
	},
	{
		name:    "Liability account deposit test",
		account: &liabilityAccount,
		amount:  10.50,
		result:  189.50,
	},
}

var withdrawalTests = []struct {
	name    string
	account *domains.AccountDomain
	amount  float64
	result  float64
}{
	{
		name:    "Asset account withdraw test",
		account: &assetAccount,
		amount:  10.84,
		result:  89.16,
	},
	{
		name:    "Liability account withdraw test",
		account: &liabilityAccount,
		amount:  20.50,
		result:  220.50,
	},
}

func TestDeposit(t *testing.T) {
	resetAccounts()
	for _, test := range depositTests {
		accCtx := AccountDepositContext{}
		accCtx.Initialize(test.account, test.name, time.Now(), test.amount)
		accCtx.Execute()
		balance := test.account.Balance()
		if balance != test.result {
			t.Errorf("Test: %s failed, account balance = %f, expected result = %f",
				test.name, balance, test.result)
		}
	}
}

func TestWithdrawal(t *testing.T) {
	resetAccounts()
	for _, test := range withdrawalTests {
		accCtx := AccountWithdrawContext{}
		accCtx.Initialize(test.account, test.name, time.Now(), test.amount)
		accCtx.Execute()
		balance := test.account.Balance()
		if balance != test.result {
			t.Errorf("Test: %s failed, account balance = %f, expected result = %f",
				test.name, balance, test.result)
		}
	}
}
