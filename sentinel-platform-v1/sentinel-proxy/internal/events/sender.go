package events

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func SendEvent(event Event) {

	jsonData, err := json.Marshal(event)
	if err != nil {
		log.Printf("JSON marshal failed: %v", err)
		return
	}

	client := &http.Client{
		Timeout: 2 * time.Second,
	}

	resp, err := client.Post(
		"http://agent:7777/event",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		log.Printf("Rust agent unreachable: %v", err)
		return
	}

	defer resp.Body.Close()

	log.Printf("Event shipped to Rust agent for user:")
}
