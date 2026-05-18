package handlers

import (
	"net/http"

	"github.com/omar/zero-trust-idp/db"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "Missing refresh token", http.StatusBadRequest)
		return
	}

	refreshToken := cookie.Value


	hashed := HashToken(refreshToken)

	userID, err := db.GetSession(hashed)
	if err != nil {
		http.Error(w, "Invalid or expired refresh token", http.StatusUnauthorized)
		return
	}

	user, err := db.GetUserByID(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	role := "user"

	if user.WebAuthnName() == "bob" {
		role = "admin"
	}

	newAccessToken, err := GenerateAccessToken(
		user.WebAuthnName(),
		role,
	)

	if err != nil {
		http.Error(w, "Failed to generate access token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    newAccessToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   900,
	})

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{
		"access_token": "` + newAccessToken + `"
	}`))
}
