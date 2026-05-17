package com.vortex;

import org.springframework.stereotype.Service;

@Service
public class DetectionService {

    public DetectionResult scan(String content) {

        String normalized = content.toLowerCase();

        if (normalized.contains("union select")) {

            return new DetectionResult(
                    "SQL_INJECTION",
                    "SQL injection indicators detected.",
                    "CRITICAL"
            );

        } else if (
                normalized.contains("powershell") ||
                normalized.contains("invoke-expression")
        ) {

            return new DetectionResult(
                    "POWERSHELL",
                    "PowerShell execution patterns detected.",
                    "HIGH"
            );

        } else if (
                normalized.contains("cmd.exe")
        ) {

            return new DetectionResult(
                    "COMMAND_INJECTION",
                    "Command execution patterns detected.",
                    "HIGH"
            );

        } else if (
                normalized.contains("<script>")
        ) {

            return new DetectionResult(
                    "XSS",
                    "Cross-site scripting payload detected.",
                    "MEDIUM"
            );

        } else if (
                normalized.contains("encrypt") ||
                normalized.contains("bitcoin") ||
                normalized.contains("decrypt") ||
                normalized.contains("ransom")
        ) {

            return new DetectionResult(
                    "RANSOMWARE",
                    "Ransomware-related indicators detected.",
                    "CRITICAL"
            );

        }

        return new DetectionResult(
                "SAFE",
                "No suspicious patterns detected.",
                "LOW"
        );
    }
}
