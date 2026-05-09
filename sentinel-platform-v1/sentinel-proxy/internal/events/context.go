package events

import "net/http"

func RequestMetadata(r *http.Request) map[string]string {
	return map[string]string{
		"path":   r.URL.Path,
		"method": r.Method,
		"query":  r.URL.RawQuery,
	}
}
