package domains

import (
	"testing"
	"time"
)

var mosesCheckingAccount = AccountDomain{
	AccountInfo: &AccountInfo{
		StartingBalance: 100,
	},
	Entries: make([]*EntryItem, 0),
}

var balanceTests = []struct {
	name      string
	account   AccountDomain
	transtype string
	amount    float64
	result    float64
}{
	{
		name:      "Credit Test",
		account:   mosesCheckingAccount,
		transtype: CREDIT,
		amount:    50.00,
		result:    150.00,
	},
	{
		name:      "Debit Test",
		account:   mosesCheckingAccount,
		transtype: DEBIT,
		amount:    40.50,
		result:    59.50,
	},
}

func TestBalance(t *testing.T) {
	for _, test := range balanceTests {
		test.account.RecordTransaction(test.name, time.Now(), test.amount, test.transtype)
		balance := test.account.Balance()
		if balance != test.result {
			t.Errorf("Test: %s failed, account balance = %f, expected result = %f",
				test.name, balance, test.result)
		}

	}
}
