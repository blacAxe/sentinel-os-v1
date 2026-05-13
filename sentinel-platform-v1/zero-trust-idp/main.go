package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/joho/godotenv"
	"github.com/omar/zero-trust-idp/db"
	"github.com/omar/zero-trust-idp/handlers"
)

func secretHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.Write([]byte(`{
		"message":"Access granted",
		"role":"admin",
		"username":"bob"
	}`))
}

func main() {
	if os.Getenv("DOCKER_CONTAINER") != "true" {
		godotenv.Load()
	}

	// Initialize DB
	err := db.InitDB()
	if err != nil {
		log.Fatal("DB init failed:", err)
	}

	// Configure the WebAuthn instance
	wconfig := &webauthn.Config{
		RPDisplayName: "Zero Trust IDP",
		RPID:          "localhost",
		//  Added 3000 to origins so the browser allows the passkey handshake
		RPOrigins: []string{"http://localhost:8080", "http://localhost:3000", "http://localhost:8081"},
	}

	webAuthnInstance, err := webauthn.New(wconfig)
	if err != nil {
		log.Fatal("Failed to create WebAuthn instance:", err)
	}

	// Create a NEW ServeMux
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./static"))

	// Registration Routes
	mux.HandleFunc("/register/begin", func(w http.ResponseWriter, r *http.Request) {
		handlers.BeginRegistration(w, r, webAuthnInstance)
	})
	mux.HandleFunc("/register/finish", func(w http.ResponseWriter, r *http.Request) {
		handlers.FinishRegistration(w, r, webAuthnInstance)
	})

	// Login Routes
	mux.HandleFunc("/login/begin", func(w http.ResponseWriter, r *http.Request) {
		handlers.BeginLogin(w, r, webAuthnInstance)
	})
	mux.HandleFunc("/login/finish", func(w http.ResponseWriter, r *http.Request) {
		handlers.FinishLogin(w, r, webAuthnInstance)
	})

	mux.HandleFunc("/api/admin", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ADMIN DATA: top secret"))
	})

	mux.HandleFunc("/api/user", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("USER DATA: general access"))
	})

	mux.HandleFunc("/auth/refresh", handlers.RefreshToken)
	mux.HandleFunc("/auth/logout", handlers.Logout)

	// Protected Route
	mux.HandleFunc("/api/secret-data", handlers.JWTMiddleware(secretHandler))

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	// Serve frontend (index.html) at root
	mux.Handle("/", fileServer)

	// Start the server
	// Start the server
	log.Println("Server started at http://localhost:8080")
	err = http.ListenAndServe(":8080", mux)
}
