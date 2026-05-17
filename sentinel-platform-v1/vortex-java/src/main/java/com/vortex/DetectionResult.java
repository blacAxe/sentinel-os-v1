package com.vortex;

public class DetectionResult {

    private String result;
    private String summary;
    private String severity;

    public DetectionResult(
            String result,
            String summary,
            String severity
    ) {
        this.result = result;
        this.summary = summary;
        this.severity = severity;
    }

    public String getResult() {
        return result;
    }

    public String getSummary() {
        return summary;
    }

    public String getSeverity() {
        return severity;
    }
}


