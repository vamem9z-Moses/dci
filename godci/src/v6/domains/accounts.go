package domains

import "time"

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
