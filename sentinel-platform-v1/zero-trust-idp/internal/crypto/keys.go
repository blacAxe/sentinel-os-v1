package crypto

import (
	"crypto/rand"
	"crypto/rsa"
)

func GenerateIdPKeys() (*rsa.PrivateKey, error) {
	reader := rand.Reader
	bitSize := 2048

	key, err := rsa.GenerateKey(reader, bitSize)
	if err != nil {
		return nil, err
	}

	return key, nil
}
