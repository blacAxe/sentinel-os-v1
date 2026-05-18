package middleware

import (
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/omar/sentinel-proxy/internal/context"
	authctx "github.com/omar/sentinel-proxy/internal/context"
	"github.com/omar/sentinel-proxy/internal/events"
	"github.com/omar/sentinel-proxy/internal/telemetry"
)

type Client struct {
	Requests []int64
}

var clients = make(map[string]*Client)

func RateLimiter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		path := r.URL.Path

		if path == "/favicon.ico" ||
			strings.Contains(path, ".well-known") {
			next.ServeHTTP(w, r)
			return
		}

		if context.IsExcludedPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, "/stats") ||
			strings.HasPrefix(r.URL.Path, "/logs") ||
			strings.HasPrefix(r.URL.Path, "/dashboard") {
			next.ServeHTTP(w, r)
			return
		}

		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip, _, _ = net.SplitHostPort(r.RemoteAddr)
		}

		now := time.Now().Unix()

		client, exists := clients[ip]
		if !exists {
			client = &Client{}
			clients[ip] = client
		}

		var valid []int64
		for _, t := range client.Requests {
			if now-t < 10 {
				valid = append(valid, t)
			}
		}

		client.Requests = append(valid, now)

		if len(client.Requests) > 10 {
			requestID := r.Context().Value(RequestIDKey).(string)

			userID := "anonymous"

			if reqCtx, ok := authctx.GetRequestContext(r.Context()); ok {
				userID = reqCtx.UserID
			}

			metadata := events.RequestMetadata(r)
			metadata["attack_type"] = "RATE_LIMIT"

			event := events.NewEvent(
				events.EventRateLimitBlocked,
				"proxy.ratelimiter",
				events.SeverityWarning,
				requestID,
				userID,
				ip,
				"blocked",
				metadata,
			)

			telemetry.Emit(event)

			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
