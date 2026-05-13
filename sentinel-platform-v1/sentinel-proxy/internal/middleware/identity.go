package middleware

import (
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/omar/sentinel-proxy/internal/auth"
	authctx "github.com/omar/sentinel-proxy/internal/context"
)

func Identity(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		userID := "anonymous"
		authenticated := false

		authHeader := r.Header.Get("Authorization")

		// fallback to cookie auth
		if authHeader == "" {
			cookie, err := r.Cookie("access_token")
			if err == nil {
				authHeader = cookie.Value
			}
		}

		// remove Bearer prefix
		if after, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
			authHeader = after
		}

		log.Printf("AUTH HEADER: %s", authHeader)

		// validate token
		if authHeader != "" {
			username, err := auth.DecodeUsernameFromToken(authHeader)

			if err != nil {
				log.Printf("JWT DECODE ERROR: %v", err)
			} else {
				log.Printf("JWT USERNAME: %s", username)

				userID = username
				authenticated = true
			}
		}

		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip, _, _ = net.SplitHostPort(r.RemoteAddr)
		}

		requestID := ""

		if existing, ok := authctx.GetRequestContext(r.Context()); ok {
			requestID = existing.RequestID
		}

		reqCtx := &authctx.RequestContext{
			RequestID:     requestID,
			UserID:        userID,
			Authenticated: authenticated,
			IPAddress:     ip,
		}

		ctx := authctx.SetRequestContext(r.Context(), reqCtx)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
