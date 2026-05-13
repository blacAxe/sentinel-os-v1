package proxy

import (
	"log"
	"net/http"
	"os"

	"github.com/omar/sentinel-proxy/internal/config"
	"github.com/omar/sentinel-proxy/internal/middleware"
)

type App struct {
	Config *config.Config
}

func NewApp() *App {
	return &App{
		Config: config.Load(),
	}
}

func (a *App) Start() {

	mux := BuildRoutes()

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
