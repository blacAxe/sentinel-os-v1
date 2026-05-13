package proxy

import (
	"encoding/json"
	"net/http"

	"github.com/omar/sentinel-proxy/internal/metrics"
	"github.com/omar/sentinel-proxy/internal/middleware"
)

func BuildRoutes() *http.ServeMux {

	idpProxy := getIDPProxy()
	vortexProxy := getVortexProxy()

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

	return mux
}
