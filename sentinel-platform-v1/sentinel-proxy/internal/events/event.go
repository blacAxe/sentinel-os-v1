package events

import "time"

type Event struct {
	ID        string    `json:"id"`
	Type      string `json:"event_type"`
	Source    string    `json:"source"`
	Timestamp time.Time `json:"timestamp"`

	Severity string `json:"severity"`

	UserID    string `json:"user_id,omitempty"`
	RequestID string `json:"request_id,omitempty"`
	IP        string `json:"ip,omitempty"`

	Action string `json:"action,omitempty"`

	Metadata map[string]string `json:"metadata,omitempty"`
}
