package contexts

import (
	"fmt"
	"time"
	"v6/domains"
)

type TransferMoneySource struct {
	*domains.AccountDomain
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

type TransferMoneyContext struct {
	Amount        float64
	SourceAccount TransferMoneySource
	DestAccount   *domains.AccountDomain
}

func (ctx *TransferMoneyContext) Initialize(amt float64, source *domains.AccountDomain, dest *domains.AccountDomain) {
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
	Creditors     []*domains.AccountDomain
}

func (pbc *PayBillsContext) Initialize(source *domains.AccountDomain, creditAccts []*domains.AccountDomain) {
	pbc.SourceAccount = TransferMoneySource{AccountDomain: source}
	pbc.Creditors = creditAccts

}

func (pbc *PayBillsContext) Execute() {
	pbc.SourceAccount.PayBills(pbc)
}
