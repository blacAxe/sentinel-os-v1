package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"

	authctx "github.com/omar/sentinel-proxy/internal/context"
	"github.com/omar/sentinel-proxy/internal/events"
	"github.com/omar/sentinel-proxy/internal/rules"
	"github.com/omar/sentinel-proxy/internal/telemetry"
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

		blocked, reason := rules.EvaluateRequest(r, query)

		if blocked {
			userID := "anonymous"

			if reqCtx, ok := authctx.GetRequestContext(r.Context()); ok {
				userID = reqCtx.UserID
			}

			fmt.Printf("WAF USER: %s\n", userID)

			metadata := events.RequestMetadata(r)
			metadata["attack_type"] = reason

			event := events.NewEvent(
				events.EventWAFBlocked,
				"proxy.waf",
				events.SeverityCritical,
				requestID,
				userID,
				ip,
				"blocked",
				metadata,
			)

			telemetry.Emit(event)

			http.Error(w, "Blocked by Sentinel", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
