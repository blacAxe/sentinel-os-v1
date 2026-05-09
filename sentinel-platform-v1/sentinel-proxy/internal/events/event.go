package events

import "time"

type Event struct {
	ID        string
	Type      string
	Source    string
	Timestamp time.Time
	UserID    string
	Payload   any
}
