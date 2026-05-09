package events

import "strings"

func TopicForEvent(event Event) string {

	switch {

	case strings.HasPrefix(event.Type, "waf."):
		return "security-events"

	case strings.HasPrefix(event.Type, "ratelimit."):
		return "security-events"

	case strings.HasPrefix(event.Type, "auth."):
		return "auth-events"

	default:
		return "logs-raw"
	}
}