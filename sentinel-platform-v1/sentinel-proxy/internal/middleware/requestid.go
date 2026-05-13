package middleware

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	authctx "github.com/omar/sentinel-proxy/internal/context"
)

type contextKey string

const RequestIDKey contextKey = "request_id"

func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := uuid.New().String()

		reqCtx, ok := authctx.GetRequestContext(r.Context())

		if !ok || reqCtx == nil {
			reqCtx = &authctx.RequestContext{}
		}

		reqCtx.RequestID = id

		ctx := authctx.SetRequestContext(r.Context(), reqCtx)

		ctx = context.WithValue(ctx, RequestIDKey, id)

		r = r.WithContext(ctx)

		w.Header().Set("X-Request-ID", id)

		next.ServeHTTP(w, r)
	})
}
