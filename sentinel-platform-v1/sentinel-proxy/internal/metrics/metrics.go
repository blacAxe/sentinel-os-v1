package metrics

import (
	"sync"
	"time"

	"github.com/omar/sentinel-proxy/internal/events"
)

var mu sync.Mutex

var Total int
var Blocked int
var Allowed int

var attackCounts = make(map[string]int)
var ipCounts = make(map[string]int)
var requestTimeline = make(map[int64]int)

type Stats struct {
	Total   int `json:"total"`
	Blocked int `json:"blocked"`
	Allowed int `json:"allowed"`
}

func IncTotal() {
	mu.Lock()
	defer mu.Unlock()
	Total++
}

func IncBlocked() {
	mu.Lock()
	defer mu.Unlock()
	Blocked++
}

func IncAllowed() {
	mu.Lock()
	defer mu.Unlock()
	Allowed++
}


func GetStats() Stats {
	mu.Lock()
	defer mu.Unlock()

	return Stats{
		Total:   Total,
		Blocked: Blocked,
		Allowed: Allowed,
	}
}

func IncAttack(attackType string) {
	if attackType == "" {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	attackCounts[attackType]++
}

func IncIP(ip string) {
	if ip == "" {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	ipCounts[ip]++
}

func GetTopAttack() (string, int) {
	mu.Lock()
	defer mu.Unlock()

	var top string
	var max int

	for k, v := range attackCounts {
		if v > max {
			top = k
			max = v
		}
	}
	return top, max
}

func GetTopIP() (string, int) {
	mu.Lock()
	defer mu.Unlock()

	var top string
	var max int

	for k, v := range ipCounts {
		if v > max {
			top = k
			max = v
		}
	}
	return top, max
}

func IncTimeline() {
	mu.Lock()
	defer mu.Unlock()

	now := time.Now().Unix()
	requestTimeline[now]++
}

func GetTimeline() map[int64]int {
	mu.Lock()
	defer mu.Unlock()

	copy := make(map[int64]int)
	for k, v := range requestTimeline {
		copy[k] = v
	}
	return copy
}

func ProcessEvent(e events.Event) {
	mu.Lock()
	defer mu.Unlock()

	Total++

	if e.Action == "blocked" {
		Blocked++
	}

	if e.Action == "allowed" {
		Allowed++
	}

	if e.Metadata["attack_type"] != "" {
		attackCounts[e.Metadata["attack_type"]]++
	}

	if e.IP != "" {
		ipCounts[e.IP]++
	}

	now := time.Now().Unix()
	requestTimeline[now]++
}
