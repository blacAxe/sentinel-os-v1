package com.vortex;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private WorkerService workerService;

    @PostMapping("/submit")
    public ResponseEntity<VortexJob> submitJob(@RequestParam("file") MultipartFile file) {
        try {

            String uploadDir = "uploads/";
            Files.createDirectories(Paths.get(uploadDir));

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path filepath = Paths.get(uploadDir, filename);

            Files.write(filepath, file.getBytes());

            VortexJob job = new VortexJob(
                    file.getOriginalFilename(),
                    "PENDING",
                    filepath.toString()
            );

            job = jobRepository.save(job);

            workerService.processFile(job);

            return ResponseEntity.ok(job);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all")
    public List<VortexJob> getAllJobs() {
        return jobRepository.findAll();
    }

        @GetMapping("/result/{type}")
    public List<VortexJob> getByResult(@PathVariable String type) {
        return jobRepository.findByResult(type.toUpperCase());
    }

    @GetMapping("/severity/{level}")
    public List<VortexJob> getBySeverity(@PathVariable String level) {
        return jobRepository.findBySeverity(level.toUpperCase());
    }

    @GetMapping("/status/{status}")
    public List<VortexJob> getByStatus(@PathVariable String status) {
        return jobRepository.findByStatus(status.toUpperCase());
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {

        Map<String, Object> stats = new HashMap<>();

        List<VortexJob> jobs = jobRepository.findAll();

        long processing = jobs.stream()
                .filter(j -> "PROCESSING".equals(j.status))
                .count();

        long completed = jobs.stream()
                .filter(j -> "COMPLETED".equals(j.status))
                .count();

        long failed = jobs.stream()
                .filter(j -> "FAILED".equals(j.status))
                .count();

        stats.put("totalJobs", jobs.size());
        stats.put("processing", processing);
        stats.put("completed", completed);
        stats.put("failed", failed);
        stats.put("activeWorkers", WorkerService.activeJobs.get());

        return stats;
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {

        Map<String, Object> analytics = new HashMap<>();

        List<VortexJob> jobs = jobRepository.findAll();

        long critical = jobs.stream()
                .filter(j -> "CRITICAL".equals(j.severity))
                .count();

        long high = jobs.stream()
                .filter(j -> "HIGH".equals(j.severity))
                .count();

        long medium = jobs.stream()
                .filter(j -> "MEDIUM".equals(j.severity))
                .count();

        long low = jobs.stream()
                .filter(j -> "LOW".equals(j.severity))
                .count();

        analytics.put("critical", critical);
        analytics.put("high", high);
        analytics.put("medium", medium);
        analytics.put("low", low);

        return analytics;
    }
}