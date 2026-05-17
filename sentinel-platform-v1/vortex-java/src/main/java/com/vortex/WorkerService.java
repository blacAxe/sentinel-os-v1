package com.vortex;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class WorkerService {

    private final String[] workers = {
        "worker-alpha",
        "worker-beta",
        "worker-gamma"
    };

    private int workerIndex = 0;

    private synchronized String nextWorker() {
        String worker = workers[workerIndex];
        workerIndex = (workerIndex + 1) % workers.length;
        return worker;
    }

    public static AtomicInteger activeJobs = new AtomicInteger(0);

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private DetectionService detectionService;

    @Async
    public void processFile(VortexJob job) {

        long start = System.currentTimeMillis();

        activeJobs.incrementAndGet();

        try {

            job.status = "PROCESSING";
            job.workerNode = nextWorker();

            jobRepository.save(job);

            String content;

            if (job.filepath.toLowerCase().endsWith(".pdf")) {

                PDDocument document = Loader.loadPDF(new File(job.filepath));

                PDFTextStripper stripper = new PDFTextStripper();

                content = stripper.getText(document);

                document.close();

            } else {

                content = Files.readString(Paths.get(job.filepath));
            }

            DetectionResult detection = detectionService.scan(content);

            job.result = detection.getResult();
            job.summary = detection.getSummary();
            job.severity = detection.getSeverity();

            long end = System.currentTimeMillis();

            job.scanDurationMs = end - start;

            job.status = "COMPLETED";

            jobRepository.save(job);

            System.out.println(
                    "[VORTEX] " +
                    job.workerNode +
                    " completed scan for " +
                    job.name +
                    " in " +
                    job.scanDurationMs +
                    "ms"
            );

        } catch (Exception e) {

            job.status = "FAILED";
            job.result = "ERROR";
            job.summary = e.getMessage();

            jobRepository.save(job);

        } finally {

            activeJobs.decrementAndGet();
        }
    }
}
