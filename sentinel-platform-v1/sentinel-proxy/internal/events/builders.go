package events

import "time"

func NewEvent(
	eventType string,
	source string,
	severity string,
	requestID string,
	userID string,
	ip string,
	action string,
	metadata map[string]string,
) Event {
	return Event{
		ID:        requestID,
		Type:      eventType,
		Source:    source,
		Timestamp: time.Now(),

		Severity: severity,

		UserID:    userID,
		RequestID: requestID,
		IP:        ip,

		Action: action,

		Metadata: metadata,
	}
}