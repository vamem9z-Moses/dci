package domains

import "time"

type AccountInfo struct {
	//Struct used to capture account metadata.
	VendorName      string
	AccountID       int
	UserID          int
	StartingBalance float64
	AccountType     string
	ProductCategory string
}

type EntryItem struct {
	//Struct used to capture account entries.
	AccountID       int
	Date            time.Time
	Message         string
	Amount          float64
	TransactionType string
}

type AccountDomain struct {
	//Struct used to represent an account. It is composed of static account
	//metadata and entries that record the transaction history of the
	//account.
	*AccountInfo
	Entries []*EntryItem
}

func (accDomain *AccountDomain) Balance() float64 {
	//Balance calculates the current balance of an account from the entries of the
	// account.
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
	//HasSufficentFunds determines if the account has sufficent funds to
	//cover the amount provided by the calling entity.
	if accDomain.Balance() < amount {
		return false
	}
	return true
}

func (ad *AccountDomain) RecordTransaction(message string, date time.Time, amt float64, transtype string) {
	//RecordTransaction records an entry in an account.
	er := &EntryItem{
		AccountID:       ad.AccountID,
		Date:            date,
		Amount:          amt,
		TransactionType: transtype,
		Message:         message,
	}
	ad.Entries = append(ad.Entries, er)
}
