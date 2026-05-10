package proxy

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"sync"

	"github.com/omar/sentinel-proxy/internal/config"
	"github.com/omar/sentinel-proxy/internal/metrics"
	"github.com/omar/sentinel-proxy/internal/middleware"
)

type App struct {
	Config *config.Config
}

// =========================
// SSE CLIENT STORAGE
// =========================

var (
	clients   = make(map[chan string]bool)
	clientsMu sync.Mutex
)

// NewApp initializes the App struct required by main.go
func NewApp() *App {
	return &App{
		Config: config.Load(),
	}
}

// =========================
// SSE BROADCASTER
// =========================

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

// =========================
// LOG STREAM ENDPOINT
// =========================

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

// =========================
// IDP PROXY
// =========================

func proxyTo(target *url.URL, w http.ResponseWriter, r *http.Request) {
	targetAddr := target.String() + r.URL.Path

	if r.URL.RawQuery != "" {
		targetAddr += "?" + r.URL.RawQuery
	}

	req, err := http.NewRequest(r.Method, targetAddr, r.Body)
	if err != nil {
		log.Printf("Failed to create proxy request: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req.Header = r.Header
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		log.Printf("IDP (Backend) Unreachable: %v", err)
		http.Error(w, "IDP Unreachable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {

		// Prevent duplicate CORS headers
		if key == "Access-Control-Allow-Origin" ||
			key == "Access-Control-Allow-Headers" ||
			key == "Access-Control-Allow-Methods" ||
			key == "Access-Control-Allow-Credentials" {
			continue
		}

		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// =========================
// SERVER START
// =========================

func (a *App) Start() {
	idpRaw := os.Getenv("IDP_URL")
	if idpRaw == "" {
		idpRaw = "http://idp:8080"
	}

	idpURL, err := url.Parse(idpRaw)
	if err != nil {
		log.Fatal("Invalid IDP_URL:", err)
	}

	vortexRaw := os.Getenv("VORTEX_URL")

	if vortexRaw == "" {
		vortexRaw = "http://vortex:8080"
	}

	vortexURL, err := url.Parse(vortexRaw)

	if err != nil {
		log.Fatal("Invalid VORTEX_URL:", err)
	}

	idpProxy := httputil.NewSingleHostReverseProxy(idpURL)
	vortexProxy := httputil.NewSingleHostReverseProxy(vortexURL)
	mux := http.NewServeMux()

	authHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idpProxy.ServeHTTP(w, r)
	})

	vortexHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.URL.Path = r.URL.Path[len("/vortex"):]

		vortexProxy.ServeHTTP(w, r)
	})

	mux.Handle("/auth/", authHandler)
	mux.Handle("/login/", authHandler)
	mux.Handle("/register/", authHandler)

	mux.Handle("/vortex/", middleware.JWTMiddleware(vortexHandler))

	mux.Handle("/", authHandler)

	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(metrics.GetStats())
	})
	mux.HandleFunc("/logs", logsHandler)

	// MAIN HANDLER WITH MIDDLEWARE
	finalHandler := middleware.CORS(
		middleware.Chain(
			middleware.RequestID,
			middleware.Identity,
			middleware.RateLimiter,
			middleware.WAF,
		)(mux),
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Sentinel Proxy started on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, finalHandler))
}
