package data

import (
	"errors"
	"fmt"
	"v6/domains"
)

type User struct {
	UserID    int
	LastName  string
	FirstName string
	Accounts
}

type Accounts []*domains.AccountDomain

func (as Accounts) GetAccount(productCategory string) (*domains.AccountDomain, error) {
	for _, a := range as {
		if a.ProductCategory == productCategory {
			return a, nil
		}

	}
	errorMsg := fmt.Sprintf("User Doesn't Have a %s Account", productCategory)
	return nil, errors.New(errorMsg)
}

func (as Accounts) GetAccountByID(acctID int) (*domains.AccountDomain, error) {
	for _, a := range as {
		if a.AccountID == acctID {
			return a, nil
		}

	}
	errorMsg := fmt.Sprintf("User Doesn't Have %d Account", acctID)
	return nil, errors.New(errorMsg)
}

type UserCollection []*User

type UserService struct{}

func (us UserService) GetCollection() UserCollection {
	uc := make([]*User, 0)

	MosesCheckingAccount := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       10,
			UserID:          12234,
			StartingBalance: 3090.50,
			AccountType:     domains.ASSETACCOUNT,
			ProductCategory: domains.CHECKINGACCOUNT,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	MosesSavingsAccount := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       11,
			UserID:          12234,
			StartingBalance: 20435.50,
			AccountType:     domains.ASSETACCOUNT,
			ProductCategory: domains.SAVINGSACCOUNT,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	Moses := User{
		UserID:    12234,
		LastName:  "Miles",
		FirstName: "Moses",
		Accounts:  []*domains.AccountDomain{&MosesSavingsAccount, &MosesCheckingAccount},
	}

	KathyCheckingAccount := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       20,
			UserID:          2394,
			StartingBalance: 5403.43,
			AccountType:     domains.ASSETACCOUNT,
			ProductCategory: domains.CHECKINGACCOUNT,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	KathySavingsAccount := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       21,
			UserID:          2394,
			StartingBalance: 10345.50,
			AccountType:     domains.ASSETACCOUNT,
			ProductCategory: domains.SAVINGSACCOUNT,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	Kathy := User{
		UserID:    2394,
		LastName:  "Miles",
		FirstName: "Kathy",
		Accounts:  []*domains.AccountDomain{&KathySavingsAccount, &KathyCheckingAccount},
	}

	DavidCheckingAccount := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       30,
			UserID:          394,
			StartingBalance: 6060.14,
			AccountType:     domains.ASSETACCOUNT,
			ProductCategory: domains.CHECKINGACCOUNT,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	DavidVendorAccount1 := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       31,
			UserID:          394,
			StartingBalance: 445.34,
			AccountType:     domains.LIABILITYACCOUNT,
			ProductCategory: domains.CREDITCARD,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	DavidVendorAccount2 := domains.AccountDomain{
		AccountInfo: &domains.AccountInfo{
			AccountID:       32,
			UserID:          394,
			StartingBalance: 890.34,
			AccountType:     domains.LIABILITYACCOUNT,
			ProductCategory: domains.CREDITCARD,
		},
		Entries: make([]*domains.EntryItem, 0),
	}

	David := User{
		UserID:    394,
		LastName:  "Miles",
		FirstName: "David",
		Accounts:  []*domains.AccountDomain{&DavidCheckingAccount, &DavidVendorAccount1, &DavidVendorAccount2},
	}

	uc = append(uc, &Moses, &Kathy, &David)
	return uc
}

func (us UserService) FindUser(id int) (*User, error) {
	uc := us.GetCollection()
	for _, u := range uc {
		if u.UserID == id {
			return u, nil
		}
	}
	return nil, errors.New("Cannot Find User")
}
