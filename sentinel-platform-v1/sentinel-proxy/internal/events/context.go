package events

import (
	"net/http"

	authctx "github.com/omar/sentinel-proxy/internal/context"
)

func RequestMetadata(r *http.Request) map[string]string {

	metadata := map[string]string{
		"path":        r.URL.Path,
		"method":      r.Method,
		"query":       r.URL.RawQuery,
		"user_agent":  r.UserAgent(),
		"host":        r.Host,
		"remote_addr": r.RemoteAddr,
		"referer":     r.Referer(),
	}

	if reqCtx, ok := authctx.GetRequestContext(r.Context()); ok {

		metadata["request_id"] = reqCtx.RequestID
		metadata["user_id"] = reqCtx.UserID
		metadata["ip"] = reqCtx.IPAddress

		metadata["authenticated"] = map[bool]string{
			true:  "true",
			false: "false",
		}[reqCtx.Authenticated]
	}

	return metadata
}
