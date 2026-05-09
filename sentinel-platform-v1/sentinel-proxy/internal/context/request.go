package context

import "context"

type contextKey string

const RequestContextKey contextKey = "request_context"

type RequestContext struct {
	RequestID     string
	UserID        string
	Authenticated bool
	IPAddress     string
}

func SetRequestContext(ctx context.Context, reqCtx *RequestContext) context.Context {
	return context.WithValue(ctx, RequestContextKey, reqCtx)
}

func GetRequestContext(ctx context.Context) (*RequestContext, bool) {
	reqCtx, ok := ctx.Value(RequestContextKey).(*RequestContext)
	return reqCtx, ok
}