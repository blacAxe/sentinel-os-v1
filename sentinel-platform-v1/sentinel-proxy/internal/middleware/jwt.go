package middleware

import (
	"net/http"
	"strings"
)

func JWTMiddleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {

			http.Error(w, "Missing Authorization Header", http.StatusUnauthorized)
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {

			http.Error(w, "Invalid Authorization Header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		if token == "" {

			http.Error(w, "Missing Token", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
