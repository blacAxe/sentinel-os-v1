package telemetry

import (
	"github.com/omar/sentinel-proxy/internal/events"
	"github.com/omar/sentinel-proxy/internal/logger"
	"github.com/omar/sentinel-proxy/internal/metrics"
)

func Emit(event events.Event) {

	// logging consumer
	logger.LogEvent(event)

	// metrics consumer
	metrics.ProcessEvent(event)

	// external shipping
	events.SendEvent(event)
}