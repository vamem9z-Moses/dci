package contexts

import (
	"testing"
	"time"
	"v6/data"
	"v6/domains"
	"v6/roles/rules"
)

type testContext struct {
	rules.RulesRunner
}

func (tc testContext) Execute() error {
	return nil
}

func withdrawCtxNoSavings() *AccountWithdrawContext {
	accCtx := AccountWithdrawContext{}
	us := data.UserService{}
	david, _ := us.FindUser(394)
	davidAct, _ := david.GetAccountByID(30)
	accCtx.Initialize(davidAct, "Insuffient funds and no savings account Test",
		time.Now(), 300000)
	return &accCtx
}

func withdrawInsufficientFunds() *AccountWithdrawContext {
	accCtx := AccountWithdrawContext{}
	us := data.UserService{}
	moses, _ := us.FindUser(12234)
	mosesAct, _ := moses.GetAccountByID(10)
	accCtx.Initialize(mosesAct, "Insuffient funds Test",
		time.Now(), 300000)
	return &accCtx
}

func kathy() *data.User {
	us := data.UserService{}
	kathy, _ := us.FindUser(2394)
	return kathy
}

func kathyCheckingAccount() *domains.AccountDomain {
	kathyAct, _ := kathy().GetAccountByID(20)
	return kathyAct
}

func kathySavingsAccount() *domains.AccountDomain {
	kathyAct, _ := kathy().GetAccountByID(21)
	return kathyAct
}

func withdrawSufficientFunds() *AccountWithdrawContext {
	accCtx := AccountWithdrawContext{}
	accCtx.Initialize(kathyCheckingAccount(), "Insuffient funds Test",
		time.Now(), 6000)
	return &accCtx
}

var accountProectionErrorConditions = []struct {
	name    string
	context rules.Contexter
	result  string
}{
	{
		name:    "Incorrect Context Test",
		context: testContext{},
		result:  "Not the correct context",
	},
	{
		name:    "Insuffienct funds and no savings account Test",
		context: withdrawCtxNoSavings(),
		result:  "No savings account, Insufficient funds",
	},
	{
		name:    "Insufficent funds",
		context: withdrawInsufficientFunds(),
		result:  "Insufficient funds in both accounts",
	},
}

func TestAccountProtectionionErrorConditions(t *testing.T) {
	ap := AccountProtection{}
	for _, tests := range accountProectionErrorConditions {
		err := ap.Action(tests.context)
		if err.Error() != tests.result {
			t.Errorf("Test %s failed, got %s, expected %s", tests.name,
				err.Error(), tests.result)
		}
	}

}

func TestAccountProtection(t *testing.T) {
	testname := "Sufficient funds in Saving Account Test"
	ap := AccountProtection{}
	ctx := withdrawSufficientFunds()
	err := ap.Action(ctx)
	if err != nil {
		t.Errorf("Test %s failed, got %s, expected error = nil", testname,
			err.Error())
	}
	if ctx.Account.Balance() != 6000 {
		t.Errorf("Test %s failed, remaing balance = %f, expected balance to be 0",
			testname, ctx.Account.Balance())
	}
}
