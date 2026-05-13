package proxy

import (
	"fmt"
	"net/http"
	"sync"
)

var (
	clients   = make(map[chan string]bool)
	clientsMu sync.Mutex
)

func broadcast(message string) {

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {

		select {
		case client <- message:
		default:
		}
	}
}

func logsHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)

	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	clientChan := make(chan string)

	clientsMu.Lock()
	clients[clientChan] = true
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		delete(clients, clientChan)
		clientsMu.Unlock()
		close(clientChan)
	}()

	fmt.Fprintf(w, "data: connected\n\n")
	flusher.Flush()

	notify := r.Context().Done()

	for {

		select {

		case msg := <-clientChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()

		case <-notify:
			return
		}
	}
}
