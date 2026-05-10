# Vortex Job Service

Simple Spring Boot backend that handles asynchronous file analysis and background job processing.

It exposes an API where files can be uploaded, analyzed by async workers, classified for suspicious behavior, and stored with scan results and severity levels.

---

## What this project does

* Accepts file uploads through an API
* Saves uploaded files locally
* Processes files asynchronously using worker threads
* Detects suspicious payloads and attack patterns
* Classifies detections into categories
* Assigns severity levels to threats
* Stores all scan results in an in memory database

---

## Current Detection Types

The worker currently detects patterns related to

* SQL Injection
* PowerShell execution
* Command injection
* Cross site scripting (XSS)
* Ransomware indicators

---

## Severity Levels

Each detection is assigned a severity level

* LOW
* MEDIUM
* HIGH
* CRITICAL

Example:

* SQL injection -> CRITICAL
* PowerShell execution -> HIGH
* XSS payload -> MEDIUM

---

## Tech Stack

* Java 23
* Spring Boot
* Spring Web
* Spring Data JPA
* H2 Database
* Async processing with CompletableFuture

---

## API

### Upload a file

POST /api/jobs/submit

Uploads a file and immediately returns a job entry while processing continues asynchronously.

Example using curl

```bash
curl.exe -X POST -F "file=@test.pdf" http://localhost:8080/api/jobs/submit
```

---

### Get all jobs

GET /api/jobs/all

Returns all processed jobs with

* status
* result
* severity
* summary
* timestamps

Example

```bash
curl.exe http://localhost:8080/api/jobs/all
```

---

## Example Detection Results

### SQL Injection

```json
{
  "result": "SQL_INJECTION",
  "severity": "CRITICAL"
}
```

### PowerShell Payload

```json
{
  "result": "POWERSHELL",
  "severity": "HIGH"
}
```

### XSS Payload

```json
{
  "result": "XSS",
  "severity": "MEDIUM"
}
```

---

## How it works

* A file is uploaded through the API
* The file is stored locally inside the uploads directory
* A job entry is created with status pending
* An async worker processes the file in the background
* File contents are scanned for suspicious patterns
* Detection results and severity are assigned
* The database is updated with the completed scan result

---

## Run locally

1. Clone the repo

2. Start the application

```bash
.\mvnw spring-boot:run
```

3. Upload test files with curl or PowerShell

---

## Example Test Payloads

### Safe file

```powershell
Set-Content safe.txt "hello world" ; curl.exe -X POST -F "file=@safe.txt" http://localhost:8080/api/jobs/submit
```

### SQL injection payload

```powershell
Set-Content sqli.txt "' UNION SELECT password FROM users --" ; curl.exe -X POST -F "file=@sqli.txt" http://localhost:8080/api/jobs/submit
```

### PowerShell payload

```powershell
Set-Content ps.txt "powershell Invoke-Expression payload" ; curl.exe -X POST -F "file=@ps.txt" http://localhost:8080/api/jobs/submit
```

### XSS payload

```powershell
Set-Content xss.txt "<script>alert('xss')</script>" ; curl.exe -X POST -F "file=@xss.txt" http://localhost:8080/api/jobs/submit
```

### Ransomware indicators

```powershell
Set-Content ransom.txt "encrypt bitcoin decrypt ransom" ; curl.exe -X POST -F "file=@ransom.txt" http://localhost:8080/api/jobs/submit
```

---

## Notes

This project started as a simple async job processor and evolved into a lightweight distributed-ready security analysis service.

The architecture is intentionally modular so it can later integrate into larger systems such as

* reverse proxies
* event pipelines
* observability systems
* security orchestration platforms

---

## Future Improvements

* Persistent database
* Kafka or Redis queue integration
* Distributed worker nodes
* File hash analysis
* YARA rule support
* Authentication and authorization
* Real time frontend dashboard
* Dockerized deployment
* Integration into Sentinel Platform and Sentinel OS

---