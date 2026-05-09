package auth

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/omar/sentinel-proxy/internal/config"
)

func ValidateToken(tokenString string) (jwt.MapClaims, error) {

	cfg := config.Load()

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func DecodeUsernameFromToken(tokenString string) (string, error) {

	claims, err := ValidateToken(tokenString)

	if err != nil {
		return "", err
	}

	username, ok := claims["username"].(string)

	if !ok {
		return "", errors.New("username missing")
	}

	return username, nil
}
