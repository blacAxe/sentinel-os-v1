package proxy

import (
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
)

func getIDPProxy() *httputil.ReverseProxy {

	idpRaw := os.Getenv("IDP_URL")

	if idpRaw == "" {
		idpRaw = "http://idp:8080"
	}

	idpURL, err := url.Parse(idpRaw)

	if err != nil {
		log.Fatal("Invalid IDP_URL:", err)
	}

	return httputil.NewSingleHostReverseProxy(idpURL)
}

func getVortexProxy() *httputil.ReverseProxy {

	vortexRaw := os.Getenv("VORTEX_URL")

	if vortexRaw == "" {
		vortexRaw = "http://vortex:8080"
	}

	vortexURL, err := url.Parse(vortexRaw)

	if err != nil {
		log.Fatal("Invalid VORTEX_URL:", err)
	}

	return httputil.NewSingleHostReverseProxy(vortexURL)
}

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
		log.Printf("Backend Unreachable: %v", err)
		http.Error(w, "Backend Unreachable", http.StatusBadGateway)
		return
	}

	defer resp.Body.Close()

	for key, values := range resp.Header {

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