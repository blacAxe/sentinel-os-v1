package events

const (
	EventWAFBlocked       = "waf.blocked"
	EventRateLimitBlocked = "ratelimit.blocked"

	EventAuthLoginSuccess = "auth.login.success"
	EventAuthLoginFailed  = "auth.login.failed"

	EventTokenRefresh = "token.refresh"

	EventUserLogout = "user.logout"

	EventProxyRequest = "proxy.request"
)
