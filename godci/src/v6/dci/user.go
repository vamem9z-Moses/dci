package dci

import (
	"errors"
	"fmt"
)

type User struct {
	UserID    int
	LastName  string
	FirstName string
	Accounts
}

type Accounts []*AccountDomain

func (as Accounts) GetAccount(productCategory string) (*AccountDomain, error) {
	for _, a := range as {
		if a.ProductCategory == productCategory {
			return a, nil
		}

	}
	errorMsg := fmt.Sprintf("User Doesn't Have a %s Account", productCategory)
	return nil, errors.New(errorMsg)
}

func (as Accounts) GetAccountByID(acctID int) (*AccountDomain, error) {
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

	MosesCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       10,
			UserID:          12234,
			StartingBalance: 3090.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	MosesSavingsAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       11,
			UserID:          12234,
			StartingBalance: 20435.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: SAVINGSACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	Moses := User{
		UserID:    12234,
		LastName:  "Miles",
		FirstName: "Moses",
		Accounts:  []*AccountDomain{&MosesSavingsAccount, &MosesCheckingAccount},
	}

	KathyCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       20,
			UserID:          2394,
			StartingBalance: 5403.43,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	KathySavingsAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       21,
			UserID:          2394,
			StartingBalance: 10345.50,
			AccountType:     ASSETACCOUNT,
			ProductCategory: SAVINGSACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	Kathy := User{
		UserID:    2394,
		LastName:  "Miles",
		FirstName: "Kathy",
		Accounts:  []*AccountDomain{&KathySavingsAccount, &KathyCheckingAccount},
	}

	DavidCheckingAccount := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       30,
			UserID:          394,
			StartingBalance: 6060.14,
			AccountType:     ASSETACCOUNT,
			ProductCategory: CHECKINGACCOUNT,
		},
		Entries: make([]*EntryItem, 0),
	}

	DavidVendorAccount1 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       31,
			UserID:          394,
			StartingBalance: 445.34,
			AccountType:     LIABILITYACCOUNT,
			ProductCategory: CREDITCARD,
		},
		Entries: make([]*EntryItem, 0),
	}

	DavidVendorAccount2 := AccountDomain{
		AccountInfo: &AccountInfo{
			AccountID:       32,
			UserID:          394,
			StartingBalance: 890.34,
			AccountType:     LIABILITYACCOUNT,
			ProductCategory: CREDITCARD,
		},
		Entries: make([]*EntryItem, 0),
	}

	David := User{
		UserID:    394,
		LastName:  "Miles",
		FirstName: "David",
		Accounts:  []*AccountDomain{&DavidCheckingAccount, &DavidVendorAccount1, &DavidVendorAccount2},
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
