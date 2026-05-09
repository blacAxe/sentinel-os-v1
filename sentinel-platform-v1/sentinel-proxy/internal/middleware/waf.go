package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	authctx "github.com/omar/sentinel-proxy/internal/context"
	"github.com/omar/sentinel-proxy/internal/events"
	"github.com/omar/sentinel-proxy/internal/logger"
	"github.com/omar/sentinel-proxy/internal/metrics"
	"github.com/omar/sentinel-proxy/internal/rules"
)

func WAF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID, _ := r.Context().Value(RequestIDKey).(string)
		decodedQuery, _ := url.QueryUnescape(r.URL.RawQuery)
		query := strings.ToLower(decodedQuery)

		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip, _, _ = net.SplitHostPort(r.RemoteAddr)
		}

		metrics.IncTotal()
		blocked, reason := rules.EvaluateRequest(r, query)

		if blocked {
			// Pull the ID we passed from proxy.go
			userID := "anonymous"

			if reqCtx, ok := authctx.GetRequestContext(r.Context()); ok {
				userID = reqCtx.UserID
			}

			fmt.Printf("WAF USER: %s\n", userID)

			event := events.Event{
				ID:        requestID,
				Type:      events.EventAttackDetected,
				Source:    "proxy.waf",
				Timestamp: time.Now(),
				UserID:    userID,
				Payload: map[string]any{
					"ip":           r.RemoteAddr,
					"path":         r.URL.Path,
					"method":       r.Method,
					"query":        r.URL.RawQuery,
					"attack_type":  reason,
					"action":       "blocked",
				},
			}

			logger.LogEvent(event)
			events.SendEvent(event)
			metrics.IncBlocked()

			// NOW it is safe to block the user
			http.Error(w, "Blocked by Sentinel", http.StatusForbidden)
			return
		}

		// Log Allowed for Terminal visualization

		next.ServeHTTP(w, r)
	})
}
