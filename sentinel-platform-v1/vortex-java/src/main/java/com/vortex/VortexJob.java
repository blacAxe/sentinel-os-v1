package com.vortex;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class VortexJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String name;
    public String status;
    public String filepath;
    public String result;

    @Column(length = 5000)
    public String summary;

    public LocalDateTime createdAt = LocalDateTime.now();

    public String severity;

    public Long scanDurationMs;

    public String workerNode;

    public VortexJob() {}

    public VortexJob(String name, String status, String filepath) {
        this.name = name;
        this.status = status;
        this.filepath = filepath;
    }
}