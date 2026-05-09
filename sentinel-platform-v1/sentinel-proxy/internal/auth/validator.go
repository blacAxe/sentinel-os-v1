package auth

import (
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func DecodeUsernameFromToken(tokenString string) (string, error) {

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {

		if name, ok := claims["username"].(string); ok {
			return name, nil
		}

		if sub, ok := claims["sub"].(string); ok {
			return sub, nil
		}
	}

	return "", fmt.Errorf("invalid token")
}